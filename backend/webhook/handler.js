/**
 * handler
 *
 * @author tobiasb
 * @since 2018
 */
const logger = require('../logger')(__filename)
const schema = require('../model/schema')
const channelHandler = require('../ChannelHandler')
const acl = require('../acl')
const fs = require('fs')

class WebhookHandler {
  constructor () {
    this.models = null
    this.scServer = null
  }

  init (app, scServer) {
    app.post('/hooks/*', this._handlePost.bind(this))
    app.get('/hooks/*', this._handleGet.bind(this))
    this.scServer = scServer
  }

  /**
   * Handle webhook verification request send by facebooks graph api
   * {@link https://developers.facebook.com/docs/graph-api/webhooks#verification}
   *
   * @param req
   * @param res
   * @returns {Promise<void>}
   * @private
   */
  async _handleGet (req, res) {
    let parts = req.path.substring(1).split('/')

    // remove hooks
    parts.shift()

    // get webhook ID
    const id = parts.shift()

    logger.debug("incoming webhook GET request with id: '%s' received: %o", id, parts)
    if (!this.models) {
      this.models = schema.getModels()
    }
    // get channel for webhook from DB
    const result = await this.models.Webhook.filter({id: id}).run()
    try {
      if (result.length === 1) {
        const webhook = result[0]
        const authToken = {user: webhook.actorId}
        await acl.check(authToken, webhook.channel, acl.action.PUBLISH, 'member')

        if (req.query['hub.verify_token'] === webhook.secret) {
          logger.debug('VALID verification request for webhook on channel: %s, message: %o', webhook.channel, req.query)
          res.status(200).send(req.query['hub.challenge'])
          if (webhook.type !== 'facebook') {
            const crud = schema.getCrud()
            let update = {
              type: 'Webhook',
              id: webhook.id,
              field: 'type',
              value: 'facebook'
            }
            crud.update(update, (err, res) => {
              if (err) {
                console.error(err)
              } else {
                console.log(res)
              }
            })
          }
        } else {
          logger.debug('INVALID verification request for webhook on channel: %s, message: %o', webhook.channel, req.query)
          res.sendStatus(400)
        }
      } else {
        logger.debug('no webhook with id %s found', id)
        res.sendStatus(400)
      }
    } catch (e) {
      logger.error(e)
      res.sendStatus(400)
    }
  }

  async _handlePost (req, res) {
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
    const result = await this.models.Webhook.filter({id: id}).run()
    try {
      if (result.length === 1) {
        const webhook = result[0]
        // TODO: add encryption to incoming messages and verification with signature
        const authToken = {user: webhook.actorId}
        await acl.check(authToken, webhook.channel, acl.action.PUBLISH, 'member')
        logger.debug('channel: %s, message: %o', result[0].channel, req.body)
        let message = req.body
        if (message.hasOwnProperty('entry') && message.hasOwnProperty('object') && webhook.type === 'facebook') {
          // currently only log facebooks hooks to collect some example data
          fs.appendFile('facebook-data.txt', JSON.stringify(message) + '\n\n')
          res.sendStatus(200)
        } else {
          const isPublished = await channelHandler.publish(authToken, webhook.channel, message)
          if (isPublished === false) {
            res.sendStatus(400)
          } else {
            res.sendStatus(200)
          }
        }
      } else {
        logger.debug('no webhook with id %s found', id)
        res.sendStatus(400)
      }
    } catch (e) {
      logger.error(e)
      res.sendStatus(400)
    }
  }

  async _handleFacebookData (authToken, webhook, message) {
    if (message.object === 'page') {
      message.entry.changes.forEach(async (change) => {
        if (change.field === 'feed') {
          switch (change.value.item) {
            case 'share':
              if (change.value.verb === 'add') {
                return {
                  type: 'Message',
                  content: {
                    message: change.value.message,
                    link: change.value.link
                  },
                  external: {
                    type: 'facebook',
                    id: change.value.post_id,
                    original: change
                  }
                }
              }
              break
          }
        }
      })
    }
  }
}

module.exports = WebhookHandler
