/**
 * ChannelHandler
 *
 * @author tobiasb
 * @since 2018
 */
const schema = require('./model/schema')
const {hash} = require('./util')
const rpcHandler = require('./rpc')
const logger = require('./logger')(__filename)
const pushNotifications = require('./notification')
const i18n = require('i18n')

class ChannelHandler {
  constructor () {
    this.server = null
    this.model = null
  }

  init (scServer) {
    this.server = scServer
  }

  start () {
    if (!this.model) {
      this.model = schema.getModel('Activity')
    }
    this.model.changes().then(this._onChange.bind(this))

    rpcHandler.registerRPCEndpoints({
      publish: {
        func: this.publish,
        context: this
      }
    })
  }

  _onChange (feed) {
    feed.each((err, message) => {
      if (err) {
        logger.error(err)
        return
      }
      const channel = message.channelId

      if (message.isSaved() === false) {
        // deleted activity
        logger.debug('deleted activity on channel %s: %o', channel, message)
        this.server.exchange.publish(channel, {a: 'd', c: message.id})
      } else if (message.getOldValue() === null) {
        // new activity
        logger.debug('new activity on channel %s: %o', channel, message)
        this.server.exchange.publish(channel, {a: 'a', c: message})
      } else {
        // updated activity
        logger.debug('updated activity on channel %s: %o', channel, message)
        this.server.exchange.publish(channel, {a: 'u', c: message})
      }
    })
  }

  async publish (authToken, channelId, message) {
    if (!this.model) {
      this.model = schema.getModel('Activity')
    }
    if (!message.hasOwnProperty('published') || !message.published) {
      message.published = new Date()
    }
    this.model.save(Object.assign({
      channelId: channelId,
      hash: hash(message.content),
      actorId: authToken.user
    }, message), {conflict: 'update'})

    const channel = await schema.getModel('Channel').get(channelId).run()
    const actor = await schema.getModel('Actor').get(authToken.user).run()
    let options = {
      image: 'www/build-output/resource/app/App-Logo.png',
      channelId: channelId,
      style: 'inbox',
      summaryText: i18n.__({
        phrase: 'There are %n% new messages',
        locale: actor.locale
      })
    }
    let phrase, content

    switch (message.type.toLowerCase()) {
      case 'event':
        phrase = 'New event in %s'
        content = message.content.description
        break

      case 'message':
        phrase = 'New message in %s'
        content = message.content.message
        break
    }
    if (content) {
      if (content.length > 40) {
        content = content.substring(0, 40) + '...'
      }
      pushNotifications.publish(channelId, i18n.__({
        phrase: phrase,
        locale: actor.locale
      }, channel.title), content, options)
    }
  }
}

const channelHandler = new ChannelHandler()

module.exports = channelHandler
