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
    this.pubModel = null
    this.ajv = new Ajv({allErrors: true})
  }

  init (scServer) {
    this.server = scServer
  }

  start () {
    if (!this.model) {
      this.model = schema.getModel('Activity')
    }
    if (!this.pubModel) {
      this.pubModel = schema.getModel('Publication')
    }
    this.model.changes().then(this._onActivityChange.bind(this))
    this.pubModel.changes().then(this._onPublicationChange.bind(this))

    rpcHandler.registerRPCEndpoints({
      publish: {
        func: this.publish,
        context: this
      }
    })
  }

  _onActivityChange (feed) {
    feed.each(async (err, activity) => {
      if (err) {
        logger.error(err)
        return
      }
      if (activity.isSaved() === true && activity.getOldValue() !== null) {
        // updated activity, publish on all channels
        const publications = await this.pubModel.filter({'activityId': activity.id}).run()
        publications.forEach(pub => {
          logger.debug('updated activity on channel %s: %s', pub.channelId, activity.id)
          let message = this._mergePublication(activity, pub)
          this.server.exchange.publish(pub.channelId, {a: 'u', c: message})
        })
      }
    })
  }

  _onPublicationChange (feed) {
    feed.each(async (err, publication) => {
      if (err) {
        logger.error(err)
        return
      }
      const channel = publication.channelId
      let activity, message

      if (publication.isSaved() === false) {
        // deleted activity
        logger.debug('deleted activity on channel %s: %s', channel, publication.activityId)
        this.server.exchange.publish(channel, {a: 'd', c: publication.activityId})
      } else if (publication.getOldValue() === null) {
        // new activity
        activity = await this.model.get(publication.activityId)
        message = this._mergePublication(activity, publication)
        logger.debug('new activity on channel %s: %s', channel, publication.activityId)
        this.server.exchange.publish(channel, {a: 'a', c: message})
      } else {
        // updated activity
        activity = await this.model.get(publication.activityId)
        message = this._mergePublication(activity, publication)
        logger.debug('updated activity on channel %s: %s', channel, publication.activityId)
        this.server.exchange.publish(channel, {a: 'u', c: message})
      }
    })
  }

  _mergePublication (activity, publication) {
    return Object.assign({
      actorId: publication.actorId,
      channelId: publication.channelId,
      master: publication.master,
      published: publication.published
    }, activity)
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

    if (typeof message === 'string') {
      // publish existing message in channel
      message = await this.model.get(message).run()
    } else {
      message = Object.assign({
        hash: hash(message.content)
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
    }
    // if (!message.hasOwnProperty('published') || !message.published) {
    //   message.published = new Date()
    // }
    const exists = !!message.id
    const publication = {
      channelId: channelId,
      actorId: authToken.user,
      published: new Date(),
      master: !exists
    }
    if (exists) {
      // only add new publication of activity in channel
      publication.activityId = message.id
      schema.getModel('Publication').save(publication)
    } else {
      this.model.save(message)
      publication.activityId = message.id
      schema.getModel('Publication').save(publication)
    }
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

    // TODO: move code to plugins
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
