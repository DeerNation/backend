/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * handler
 *
 * @author tobiasb
 * @since 2018
 */
const logger = require('../logger')(__filename)
const {dgraphClient, dgraph} = require('../model/dgraph')
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

  async __getWebhook (identifier) {
    const query = `query read($a: string) {
        object(func: eq(identifier, $a)) @normalize {
          uid: uid
          secret: secret
          type: type
          actor {
            actorId: uid
          }
          channel {
            channel: uid
          }
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: identifier})
    return res.getJson().object
  }

  async __updateWebhook (uid, data) {
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setSetJson(Object.assign({
        uid: uid
      }, data))
      await txn.mutate(mu)
      await txn.commit()
    } finally {
      await txn.discard()
    }
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
    // get channel for webhook from DB
    const result = await this.__getWebhook(id).run()
    try {
      if (result.length === 1) {
        const webhook = result[0]
        const authToken = {user: webhook.actorId}
        await acl.check(authToken, webhook.channel, acl.action.PUBLISH, 'member')

        if (req.query['hub.verify_token'] === webhook.secret) {
          logger.debug('VALID verification request for webhook on channel: %s, message: %o', webhook.channel, req.query)
          res.status(200).send(req.query['hub.challenge'])
          if (webhook.type !== 'facebook') {
            this.__updateWebhook(webhook.uid, {
              type: 'facebook'
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

    // get channel for webhook from DB
    const result = await this.__getWebhook(id).run()
    try {
      if (result.length === 1) {
        const webhook = result[0]
        // TODO: add encryption to incoming messages and verification with signature
        const authToken = {user: webhook.actorId}
        await acl.check(authToken, webhook.channel, acl.action.PUBLISH, 'member')
        logger.debug('channel: %s, message: %o', webhook.channel, req.body)
        let message = req.body
        if (message.hasOwnProperty('entry') && message.hasOwnProperty('object') && webhook.type === 'facebook') {
          // currently only log facebooks hooks to collect some example data
          this._transformFacebookData(message).forEach(activity => {
            channelHandler.publish(authToken, webhook.channel, activity)
          })
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

  /**
   * Transform facebooks webhook data into an array of activities
   * @param message {Map} facebooks feed webhook subscription data
   * @returns {Array}
   * @protected
   */
  _transformFacebookData (message) {
    let activities = []
    if (message.object === 'page') {
      try {
        message.entry.forEach(entryItem => {
          entryItem.changes.forEach(async (change) => {
            if (change.field === 'feed') {
              switch (change.value.item) {
                case 'share':
                  if (change.value.verb === 'add') {
                    const content = {}
                    if (change.value.message) {
                      content.message = change.value.message
                    }
                    if (change.value.link) {
                      content.link = change.value.link
                    }
                    if (Object.keys(content).length > 0) {
                      activities.push({
                        type: 'Message',
                        content: content,
                        external: {
                          type: 'facebook',
                          id: change.value.post_id,
                          original: change
                        }
                      })
                    }
                  }
                  break
              }
            }
          })
        })
      } catch (e) {
        logger.error(e)
        fs.appendFile('facebook-data.txt', JSON.stringify(message, null, 2) + '\n\n')
        return
      }
    }
    if (activities.length === 0) {
      // save unhandled data to file for later usage/analysis
      fs.appendFile('facebook-data.txt', JSON.stringify(message, null, 2) + '\n\n')
    }
    return activities
  }
}

module.exports = WebhookHandler
