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

  publish (authToken, channelId, message) {
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
      .then(() => {
        switch (message.type.toLowerCase()) {
          case 'event':
            pushNotifications.publish(channelId, message.title, message.content.description, {})
            break

          case 'message':
            pushNotifications.publish(channelId, message.title, message.content.message, {})
            break
        }
      })
  }
}

const channelHandler = new ChannelHandler()

module.exports = channelHandler
