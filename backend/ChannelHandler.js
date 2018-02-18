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
      }

      if (message && message.isSaved() === true) {
        logger.debug('publishing %o', message)
        const channel = message.channel
        delete message.channel
        this.server.exchange.publish(channel, message)
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

    let options = {
      image: 'www/build-output/resource/app/App-Logo.png',
      channelId: channelId
    }
    const channel = await schema.getModel('Channel').get(channelId).run()
    const actor = await schema.getModel('Actor').get(authToken.user).run()
    switch (message.type.toLowerCase()) {
      case 'event':
        pushNotifications.publish(channelId, i18n.__({
          phrase: 'New event in %s',
          locale: actor.locale
        }, channel.title), message.content.description, options)
        break

      case 'message':
        pushNotifications.publish(channelId, i18n.__({
          phrase: 'New message in %s',
          locale: actor.locale
        }, channel.title), message.content.message, options)
        break
    }
  }
}

const channelHandler = new ChannelHandler()

module.exports = channelHandler
