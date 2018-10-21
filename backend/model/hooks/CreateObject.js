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
const any = require('../any')
const logger = require('../../logger')(__filename)
const {protoProcessor} = require('../ProtoProcessor')

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
  if (!publication.activity || !publication.activity.payload || !publication.activity.payload.value) {
    throw new ResponseException(1, i18n.__('Creating a publication without content is not possible!'))
  }
  const content = publication.activity.payload
  const raw = content.value
  logger.debug('RAW:' + JSON.stringify(raw))
  publication.activity.payload.value = any.convertToModel(content)
  logger.debug('CONVERTED:' + JSON.stringify(publication.activity.payload, null, 2))

  if (!publication.activity.uid) {
    publication.activity.uid = '_:activity'
    publication.activity.baseName = 'Activity'
    uidMappers['activity'] = publication.activity
    publication.activity.created = new Date()
    publication.activity.actor = {uid: authToken.user}
  }

  if (!content.value && !content.uid) {
    throw new ResponseException(1, i18n.__('Creating a publication without content is not possible!'))
  }

  // prepare content model to DB-model by mapping type_url to baseName and converting the model
  publication.activity.payload = protoProcessor.anyToModel(publication.activity.payload)

  publication.actor = {uid: authToken.user}
  if (!publication.channel) {
    throw new ResponseException(1, i18n.__('Creating a publication without a channel reference is not possible!'))
  } else {
    // just add the reference, we do not want to modify anything in the channel
    publication.channel = {uid: publication.channel.uid}
  }

  publication.published = new Date()
  publication.master = !content.uid
  if (!content.uid) {
    content.uid = '_:payload'
    uidMappers['payload'] = content
    // calculate hash from content (without uid)
    publication.activity.hash = hash(raw)
  }

  // dump ExternalRef
  if (publication.activity.ref && publication.activity.ref.original) {
    publication.activity.ref.original = JSON.stringify(publication.activity.ref.original)
  }

  // remove empty strings from payload
  Object.keys(content).forEach(key => {
    if (content[key] === '') {
      delete content[key]
    }
  })
}

function postCreatePublication (authToken, publication, uidMappers) {
  logger.debug('running post create publication hook')
  publication.published = publication.published.toISOString()
  publication.activity.created = publication.activity.created.toISOString()

  // convert DB model content to one that can be processed by a proto message
  publication.activity.payload = protoProcessor.modelToAny(publication.activity.payload)

  // parse ExternalRef
  if (publication.activity.ref && publication.activity.ref.original) {
    publication.activity.ref.original = JSON.parse(publication.activity.ref.original)
  }

  // remove all baseNames
  recursiveRemoveProperty(publication, 'baseName')

  // send push notification
  channelHandler.sendNotification(authToken, publication)

  // encode again to be able to send it to the clients
  publication.activity.payload.value = any.convertFromModel(publication.activity.payload)
}

function recursiveRemoveProperty (obj, prop) {
  if (obj.hasOwnProperty(prop)) {
    delete obj[prop]
  }
  Object.values(obj)
    .filter(val => !!val && typeof val === 'object')
    .forEach(child => {
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
