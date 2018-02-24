/**
 * acl
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const schema = require('./model/schema')
const i18n = require('i18n')

class AclException extends Error {
}

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

  /**
   * Returns all allowed actions for this user in a map with the keys:
   * {
   *  actions: ...,
   *  memberActions: ...
   *  ownerActions: ...
   * }
   *
   * @param userId {String?} User whoms ACLs should be returned, if empty the guest users ACLs will be returned
   * @returns {Promise<Map>}
   */
  getEntries: async function (userId, type, topic) {
    if (this.__cache.hasOwnProperty(userId)) {
      return this.__cache[userId]
    }
    if (!userId && this.__cache.hasOwnProperty('*')) {
      return this.__cache['*']
    }
    const r = schema.getR()

    // get roles for user
    let roles = ['guest']
    if (userId) {
      // get the actors main role
      const mainRole = await schema.getModel('Actor').get(userId).run()
      roles.push(mainRole.role)

      // get all other roles the actor is associated to
      const userRoles = await schema.getModel('ACLRole').filter(role => {
        return role('members').contains(userId).and(role('id').eq(mainRole.role).not())
      }).orderBy(r.asc('weight')).run()
      userRoles.forEach(userRole => {
        roles.push(userRole.id)
      })
    } else {
      // use * as cache key
      userId = '*'
    }
    // console.log(roles)
    const aclEntries = await schema.getModel('ACLEntry').filter(entry => {
      return entry('targetType').eq('role')
        .and(r.expr(roles).contains(entry('target')))
        .and(entry('type').eq(type))
        .and(r.expr(topic).match(entry('topic')))
    }).run()
    // console.log(aclEntries)

    let acl = {
      actions: '',
      memberActions: '',
      ownerActions: ''
    }
    // merge entries by role-weight
    aclEntries.forEach(entry => {
      this.__mergeAcls(acl, entry)
    })
    this.__cache[userId] = acl
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
   * @param userId {String?} userID whoms ACLEntry-Cache should be cleared, in undefinex all caches are cleared
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
   * @param what {String} a | separated string of type|topic
   * @param actions {String} a combination of acl.CREATE, acl.READ, ...
   * @param authToken {Object} auth token of the current user
   * @param actionType {String} type of actions to check (null, member, owner)
   * @param exceptionText {String?} optional text if the check fails
   * @returns {boolean} true if the check succeeds
   * @throws {AclException} if the check fails
   */
  check: function (what, actions, authToken, actionType, exceptionText) {
    // TODO read and evaluate ACLs, throw exception on failure
    const allowed = this.getAllowedActions(what, authToken)
    if (!allowed) {
      if (exceptionText) {
        throw new AclException(exceptionText)
      } else {
        throw new AclException(i18n.__('You do not have the rights to do this.'))
      }
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
      }

      for (let i = 0, l = actions.length; i < l; i++) {
        if (!(actions.charAt(i) in allowedActions)) {
          return false
        }
      }
      return true
    }
  },

  /**
   * Returns a concatenated string with all allowed actions on the topic
   * @param what {String} a | separated string of type|topic
   * @param authToken {Object} auth token of the current user
   * @returns {string} concatenated allowed actions
   */
  getAllowedActions: function (what, authToken) {
    const {type, topic} = what.split('|')
    return this.getEntries(authToken && authToken.user, type, topic)
  },

  AclException: AclException
}
