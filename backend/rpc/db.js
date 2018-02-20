/**
 * db
 *
 * @author tobiasb
 * @since 2018
 */

const schema = require('../model/schema')
const acl = require('../acl')
const i18n = require('i18n')
const config = require('../config')
const logger = require('../logger')(__filename)

function getSubscriptions (authToken) {
  return schema.getModel('Subscription').filter({actorId: authToken.user}).run()
}

/**
 * Return all channels the current user is subscribed to + the public ones
 * @param authToken
 */
function getChannels (authToken) {
  // TODO: we need ACLs for a finer grained access level definition
  acl.check('channel', acl.action.READ, authToken)
  const r = schema.getR()
  let filter = r.row('right')('type').eq('PUBLIC').or(r.row('right')('ownerId').eq(authToken.user))
  return r.table('Subscription').eqJoin('channelId', r.table('Channel')).filter(filter).map(function (entry) {
    return entry('right')
  }).run()
}

function getChannelActivities (authToken, channel, from) {
  acl.check('activity', acl.action.READ, authToken)
  const r = schema.getR()
  let filter = r.row('channelId').eq(channel).and(r.row.hasFields('actorId'))
  if (from) {
    filter.and(r.row('published').ge(from))
  }
  return schema.getModel('Activity').filter(filter).orderBy(r.asc('published')).run()
}

function getActors (authToken) {
  acl.check('actor', acl.action.READ, authToken)
  return schema.getModel('Actor').pluck('id', 'name', 'username', 'type', 'role', 'online', 'status', 'color').run()
}

function createChannel (authToken, channelData) {
  acl.check('channel', acl.action.CREATE, authToken, i18n.__('You are not allowed to create this channel.'))

  const channelId = config.channelPrefix + channelData.name.toLowerCase() + (channelData.private ? '.private' : '.public')
  const crud = schema.getCrud()
  return new Promise((resolve, reject) => {
    crud.create({
      type: 'Channel',
      value: {
        id: channelId,
        title: channelData.name,
        type: channelData.private ? 'PRIVATE' : 'PUBLIC',
        ownerId: authToken.user
      }
    }, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  }).then(() => {
    return new Promise((resolve, reject) => {
      crud.create({
        type: 'Subscription',
        value: {
          channelId: channelId,
          actorId: authToken.user
        }
      }, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  })
}

function getObject (authToken, type, id) {
  acl.check(type.toLowerCase(), acl.action.READ, authToken, i18n.__('You are not allowed to read this item.'))

  return schema.getModel(type).get(id).run()
}

function updateObjectProperty (authToken, type, id, prop, value) {
  acl.check(type.toLowerCase() + '.' + id + '.' + prop, acl.action.write, authToken, i18n.__('You are not allowed to update property %s of this item.', prop))

  const crud = schema.getCrud()
  return new Promise((resolve, reject) => {
    crud.update({
      type: type,
      id: id,
      field: prop,
      value: value
    }, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

function setFirebaseToken (authToken, firebaseToken, oldToken) {
  acl.check('firebase', acl.action.UPDATE, authToken, i18n.__('You are not allowed to save this token.'))
  const crud = schema.getCrud()

  if (oldToken) {
    // delete old token
    schema.getModel('Firebase').filter({token: oldToken}).delete()
  }

  if (firebaseToken) {
    return schema.getModel('Firebase').filter({token: firebaseToken}).run()
      .then((res) => {
        if (res && res.length > 0) {
          return new Promise((resolve, reject) => {
            crud.update({
              type: 'Firebase',
              id: res[0].id,
              value: {
                token: firebaseToken,
                actorId: authToken.user
              }
            }, (err, res) => {
              if (err) {
                reject(err)
              } else {
                resolve(res)
              }
            })
          })
        } else {
          return new Promise((resolve, reject) => {
            crud.create({
              type: 'Firebase',
              value: {
                actorId: authToken.user,
                token: firebaseToken
              }
            }, (err, res) => {
              if (err) {
                reject(err)
              } else {
                resolve(res)
              }
            })
          })
        }
      })
      .catch(() => {
        return new Promise((resolve, reject) => {
          crud.create({
            type: 'Firebase',
            value: {
              actorId: authToken.user,
              token: firebaseToken
            }
          }, (err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          })
        })
      })
  }
}

function deleteActivity (authToken, id) {
  acl.check('activity', acl.action.DELETE, authToken, i18n.__('You are not allowed to delete entries in this channel.'))
  return new Promise((resolve, reject) => {
    // message specific check
    schema.getModel('Activity').get(id).run().then(activity => {
      if (!activity) {
        // we cannot delete what does not exist
        resolve(true)
      }
      const doDelete = function () {
        activity.delete()
        resolve(true)
        // publish deletion on channel

      }
      if (activity.actorId === authToken.user) {
        // user is owner of the message
        doDelete()
      } else {
        schema.getModel('Subscription').filter({
          channelId: activity.channelId,
          actorId: authToken.user
        }).run().then(subs => {
          if (subs.length === 1) {
            if (subs[0].actorId === authToken.user) {
              // user is owner of this channel
              doDelete()
            } else {
              schema.getModel('Actor').get(id).run().then(actor => {
                if (actor.getRole() === 'admin') {
                  doDelete()
                } else {
                  reject(new Error(i18n.__('You are not allowed to delete this entry.')))
                }
              })
            }
          } else if (subs.length === 0) {
            reject(new Error(i18n.__('You are not allowed to delete this entry.')))
            logger.error('The User is not subscribed to this channel')
          } else {
            reject(new Error(i18n.__('You are not allowed to delete this entry.')))
            logger.error('Multiple subscriptions found for channel' + activity.channelId + ' and user ' + authToken.user)
          }
        })
      }
    })
  })
}

module.exports = {
  getChannels: getChannels,
  getSubscriptions: getSubscriptions,
  getChannelActivities: getChannelActivities,
  getActors: getActors,
  createChannel: createChannel,
  getObject: getObject,
  updateObjectProperty: updateObjectProperty,
  setFirebaseToken: setFirebaseToken,
  deleteActivity: deleteActivity
}
