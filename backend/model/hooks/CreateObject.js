/**
 * CreateObject
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const config = require('../../config')
const i18n = require('i18n')
const {ResponseException} = require('../../exceptions')
const {hash} = require('../../util')
const channelHandler = require('../../ChannelHandler')

function preCreateSubscription (authToken, object, uidMappers) {
  // if channel is new, we need to add some data to it
  if (!object.channel.uid) {
    // channel is new
    let type = 'public'
    Object.keys(proto.dn.model.Channel.Type).some(typeName => {
      if (proto.dn.model.Channel.Type[typeName] === object.channel.type) {
        type = typeName.toLowerCase()
        return true
      }
    })
    object.channel.id = config.channelPrefix + object.channel.title.toLowerCase() + '.' + type
    // new channel create current user is the owner
    object.channel.owner = {uid: authToken.user}
    object.channel.uid = '_:channel'
    object.channel.baseName = 'Channel'
    console.log(object.channel)
    uidMappers['channel'] = object.channel
  }
  if (!object.actor) {
    // add subscription for current user
    object.actor = {uid: authToken.user}
  } else {
    // TODO: check if the user is allowed to add subscriptions for other actors
    throw new ResponseException(2, i18n.__('You are not allowed to add subscriptions for other users'))
  }
}

function postCreateSubscription (authToken, object, uidMappers) {
  // remove baseNames again for the update notifications
  delete object.baseName
  if (object.channel) {
    delete object.channel.baseName
  }
}

/**
 * Process pre create hook for new publications.
 * Those either contain a new activity or a reference to an existing one (e.g. if a user shares an existing activity in
 * another channel)
 * @param authToken {Map}
 * @param publication {Map}
 * @param uidMappers [Map}
 */
function preCreatePublication (authToken, publication, uidMappers) {
  if (!publication.activity || !publication.activity.content) {
    throw new ResponseException(1, i18n.__('Creating a publication without content is not possible!'))
  }
  const payload = publication.activity[publication.activity.content]

  if (!publication.activity.uid) {
    publication.activity.uid = '_:activity'
    publication.activity.baseName = 'Activity'
    uidMappers['activity'] = publication.activity
    publication.activity.created = new Date()
    publication.activity.actor = {uid: authToken.user}
  }

  if (!payload) {
    throw new ResponseException(1, i18n.__('Creating a publication without content is not possible!'))
  }
  // calculate hash from content (without uid)
  const hashPayload = Object.assign({}, payload)
  delete hashPayload.uid
  publication.activity.hash = hash(hashPayload)
  publication.actor = {uid: authToken.user}
  if (!publication.channel) {
    throw new ResponseException(1, i18n.__('Creating a publication without a channel reference is not possible!'))
  } else {
    // just add the reference, we do not want to modify anything in the channel
    publication.channel = {uid: publication.channel.uid}
  }

  publication.published = new Date()
  publication.master = !payload.uid
  if (!payload.uid) {
    payload.uid = '_:payload'
    uidMappers['payload'] = payload
  }

  // remove empty strings from payload
  Object.keys(payload).forEach(key => {
    if (payload[key] === '') {
      delete payload[key]
    }
  })
}

function postCreatePublication (authToken, publication, uidMappers) {
  publication.published = publication.published.toISOString()
  publication.activity.created = publication.activity.created.toISOString()
  // remove all baseNames
  recursiveRemoveProperty(publication, 'baseName')
  channelHandler.sendNotification(authToken, publication)
}

function recursiveRemoveProperty (obj, prop) {
  if (obj.hasOwnProperty(prop)) {
    delete obj[prop]
  }
  Object.values(obj)
    .filter(val => !!val && typeof val === 'object')
    .forEach(child => {
      console.log(child)
      recursiveRemoveProperty(child, prop)
    })
}

module.exports = function (pre, authToken, type, object, uidMappers) {
  switch (type) {
    case 'subscription':
      pre ? preCreateSubscription(authToken, object, uidMappers) : postCreateSubscription(authToken, object, uidMappers)
      break

    case 'publication':
      pre ? preCreatePublication(authToken, object, uidMappers) : postCreatePublication(authToken, object, uidMappers)
      break
  }
}
