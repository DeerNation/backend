/**
 * ChannelHandler
 *
 * @author tobiasb
 * @since 2018
 */
const schema = require('./model/schema')
const {hash} = require('./util')
const logger = require('./logger')(__filename)

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
  }

  _onChange (feed) {
    feed.each((err, message) => {
      if (err) {
        console.log(err)
      }

      if (message.isSaved() === true) {
        logger.debug('publishing %o', message)
        const channel = message.channel
        delete message.channel
        this.server.exchange.publish(channel, message)
      }
    })
  }

  publish (channel, message) {
    if (!this.model) {
      this.model = schema.getModel('Activity')
    }
    if (!message.hasOwnProperty('published') || !message.published) {
      message.published = new Date()
    }
    this.model.save(Object.assign({
      channel: channel,
      hash: hash(message)
    }, message), {conflict: 'update'})
  }
}

const channelHandler = new ChannelHandler()

module.exports = channelHandler
