/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * acl
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const i18n = require('i18n')
const logger = require('./logger')(__filename)
const {AclException} = require('./exceptions')

const action = {
  CREATE: 'c',
  READ: 'r',
  UPDATE: 'u',
  DELETE: 'd',
  EXECUTE: 'x',
  ENTER: 'e',
  LEAVE: 'l',
  PUBLISH: 'p'
}

module.exports = {
  action: action,
  __cache: {},
  __dgraphClient: null,

  _getDgraphClient: function () {
    if (!this.__dgraphClient) {
      this.__dgraphClient = require('./model/dgraph').dgraphClient
    }
    return this.__dgraphClient
  },

  /**
   * Returns all allowed actions for this user in a map with the keys:
   * {
   *  actions: ...,
   *  memberActions: ...
   *  ownerActions: ...
   * }
   *
   * @param userId {String?} User whoms ACLs should be returned, if empty the guest users ACLs will be returned
   * @param topic {String} topic to check
   * @returns {Promise<Map>}
   */
  getEntries: async function (userId, topic, role) {
    let cacheId
    if (role) {
      cacheId = role + topic
    } else {
      cacheId = (userId || '*') + topic
    }
    if (this.__cache.hasOwnProperty(cacheId)) {
      return this.__cache[cacheId]
    }
    const fragment = `
      fragment AclEntry {
        topic
        actions
        ownerActions
        memberActions
        roleTarget {
          id
        }
      }
      `
    let aclEntries, acl, query
    if (role) {
      query = `query acl($a: string) {
        role(func: eq(id, $a)) @filter(eq(baseName, "ACLRole")) {
          entries : ~roleTarget {
            ...AclEntry
          }
        }
      }
      ${fragment}
      `
      const res = await this._getDgraphClient().newTxn().queryWithVars(query, {$a: role})
      const model = res.getJson()
      // console.log(JSON.stringify(model, null, 2))
      if (model.role.length > 0) {
        aclEntries = model.role[0].entries.filter(entry => {
          return (new RegExp(entry.topic)).test(topic)
        })
      } else {
        console.log(query, role)
      }
    } else {
      query = `
      guestRole(func: eq(id, "guest")) @filter(eq(baseName, "ACLRole")) {
        entries : ~roleTarget {
          ...AclEntry
        }
      }
      `
      if (userId) {
        query += `
          adminRole(func: uid($a))  {
            roles @filter(eq(id, "admin")) {
              uid
            }
          }
          
          acl(func: uid($a)) {
            roles (orderasc: weight) {
              entries : ~roleTarget {
                ...AclEntry
              }
            }
          }
        `
      }
      query = `query acl($a: string) {
          ${query}
        }` + fragment
      const res = await this._getDgraphClient().newTxn().queryWithVars(query, {$a: userId})
      const model = res.getJson()
      // console.log(JSON.stringify(model, null, 2))
      if (model.adminRole && model.adminRole.length > 0) {
        const all = Object.values(action).join('')
        acl = {
          actions: all,
          memberActions: all,
          ownerActions: all
        }
        this.__cache[cacheId] = acl
        return acl
      }

      aclEntries = model.guestRole[0].entries.filter(entry => {
        return (new RegExp(entry.topic)).test(topic)
      })
      if (model.acl && model.acl.length > 0 && model.acl[0].roles.length > 0) {
        model.acl[0].roles.forEach(role => {
          role.entries.forEach(entry => {
            if ((new RegExp(entry.topic)).test(topic)) {
              aclEntries.push(entry)
            }
          })
        })
      }
    }
    logger.debug('Topic: %s, found ACL entries: %o', topic, aclEntries)

    acl = {
      actions: '',
      memberActions: '',
      ownerActions: ''
    }
    // merge entries by role-weight
    aclEntries.forEach(entry => {
      this.__mergeAcls(acl, entry)
    })
    this.__cache[cacheId] = acl
    logger.debug('ACL: %o', acl)
    return acl
  },

  __mergeAcls: function (acl, newAcl) {
    const props = ['actions', 'memberActions', 'ownerActions']
    props.forEach(actions => {
      if (newAcl.hasOwnProperty(actions)) {
        if (!acl.hasOwnProperty(actions)) {
          acl[actions] = ''
        }
        for (let i = 0, l = newAcl[actions].length; i < l; i++) {
          let action = newAcl[actions].charAt(i)
          if (action === '-') {
            // remove this action
            i++
            action = newAcl[actions].charAt(i)
            if (acl[actions].includes(action)) {
              acl[actions].replace(action, '')
            }
          } else if (!acl[actions].includes(action)) {
            // add this action
            acl[actions] += action
          }
        }
      }
    })
  },

  /**
   * Clear the cached ACLEntries
   * @param userId {String?} userID whoms ACLEntry-Cache should be cleared, in undefined all caches are cleared
   */
  clearCache: function (userId) {
    if (userId) {
      delete this.__cache[userId]
    } else {
      Object.keys(this.__cache).forEach(prop => {
        delete this.__cache[prop]
      })
    }
  },

  /**
   * Checks if the user can execute the action on that topic, otherwise an AclException is thrown
   *
   * @param authToken {Object?} auth token of the current user
   * @param token {String} topic to check
   * @param actions {String} a combination of acl.CREATE, acl.READ, ...
   * @param actionType {String} type of actions to check (null, member, owner)
   * @param exceptionText {String?} optional text if the check fails
   * @returns {boolean} true if the check succeeds
   * @throws {AclException} if the check fails
   */
  check: async function (authToken, token, actions, actionType, exceptionText) {
    logger.debug('check %s for %s', actions, token)
    const allowed = await this.getAllowedActions(authToken, token)
    if (!exceptionText) {
      exceptionText = i18n.__('You do not have the rights to do this.')
    }
    if (!allowed) {
      throw new AclException(exceptionText)
    } else {
      let allowedActions = ''
      switch (actionType || 'actions') {
        case 'actions':
          allowedActions = allowed.actions
          break

        case 'member':
          allowedActions = allowed.memberActions
          break

        case 'owner':
          allowedActions = allowed.ownerActions
          break
      }
      if (!allowedActions) {
        throw new AclException(exceptionText)
      }
      logger.debug('Allowed actions for %s: %s', token, allowedActions)

      for (let i = 0, l = actions.length; i < l; i++) {
        if (!allowedActions.includes(actions.charAt(i))) {
          throw new AclException(exceptionText)
        }
      }
    }
  },

  /**
   * Returns a concatenated string with all allowed actions on the topic
   * @param authToken {Object?} auth token of the current user
   * @param topic {String} topic to check
   * @returns {Promise<string>} concatenated allowed actions
   */
  getAllowedActions: function (authToken, topic) {
    return this.getEntries(authToken && authToken.user, topic)
  },

  /**
   * Returns concatenated string with all allowed actions for the given role on the topic
   * @param authToken {Object?} only for compability reasons with rpc calls, not used here
   * @param role {String} Role to check
   * @param topic {String} topic to check
   * @returns {*|Promise<Map>}
   */
  getAllowedActionsForRole: function (authToken, role, topic) {
    return this.getEntries(null, topic, role)
  },

  AclException: AclException
}
