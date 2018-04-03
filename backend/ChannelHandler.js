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
const Ajv = require('ajv')
const schemaHandler = require('./model/JsonSchemaHandler')

class ChannelHandler {
  constructor () {
    this.server = null
    this.model = null
    this.ajv = new Ajv({allErrors: true})
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
        logger.debug('deleted activity on channel %s: %s', channel, message.id)
        this.server.exchange.publish(channel, {a: 'd', c: message.id})
      } else if (message.getOldValue() === null) {
        // new activity
        logger.debug('new activity on channel %s: %s', channel, message.id)
        this.server.exchange.publish(channel, {a: 'a', c: message})
      } else {
        // updated activity
        logger.debug('updated activity on channel %s: %s', channel, message.id)
        this.server.exchange.publish(channel, {a: 'u', c: message})
      }
    })
  }

  validate (message) {
    if (!this.validateActivity) {
      this.validateActivity = this.ajv.compile(schemaHandler.getSchema('Activity'))
    }
    return this.validateActivity(message)
  }

  async publish (authToken, channelId, message) {
    if (!this.model) {
      this.model = schema.getModel('Activity')
    }
    message = Object.assign({
      channelId: channelId,
      hash: hash(message.content),
      actorId: authToken.user
    }, message)

    // only allow valid activities to be published
    if (!this.validate(message)) {
      logger.error('\nNo valid activity: \n  * %s\n-------\n  %o', this.validateActivity.errors.map(x => {
        switch (x.keyword) {
          case 'additionalProperties':
            return `${x.message}: '${x.params.additionalProperty}' [${x.schemaPath}]`

          default:
            return `${x.message} [${x.schemaPath}]`
        }
      }).join('\n  * '), message)
      return false
    }
    if (!message.hasOwnProperty('published') || !message.published) {
      message.published = new Date()
    }
    const exists = !!message.id
    this.model.save(message, {conflict: 'update'})

    if (!exists) {
      // only send notifications for new activities
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
}

const channelHandler = new ChannelHandler()

module.exports = channelHandler
