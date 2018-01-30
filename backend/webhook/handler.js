/**
 * handler
 *
 * @author tobiasb
 * @since 2018
 */
const logger = require('../logger')(__filename)
const schema = require('../model/schema')
const channelHandler = require('../ChannelHandler')

class WebhookHandler {

  constructor() {
    this.models = null
    this.scServer = null
  }

  init(app, scServer) {
    app.post('/hooks/*', this._handlePost.bind(this))
    this.scServer = scServer
  }

  _handlePost(req, res) {
    // send response immediately
    res.send()

    let parts = req.path.substring(1).split('/')

    // remove hooks
    parts.shift()

    // get webhook ID
    const id = parts.shift()

    logger.debug("incoming webhook with id: '%s' received: %o", id, parts)
    if (!this.models) {
      this.models = schema.getModels()
    }

    // get channel for webhook from DB
    this.models.Webhook.filter({id: id}).run().then(result => {
      if (result.length === 1) {
        // TODO: add encryption to incoming messages and verification with signature
        logger.debug("channel: %s, message: %o", result[0].channel, req.body)
        let message = req.body
        message.actorId = result[0].actorId
        channelHandler.publish(result[0].channel, message)
      } else {
        logger.debug('no webhook with id %s found', id)
      }
    })
  }
}

module.exports = WebhookHandler