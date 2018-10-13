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
const modelSubscriptions = require('./model/ModelSubscriptions')
const logger = require('./logger')(__filename)
const pushNotifications = require('./notification')
const i18n = require('i18n')
const Ajv = require('ajv')
const schemaHandler = require('./model/JsonSchemaHandler')
const {UUID} = require('./config')
const proto = require('./model/protos')
const {dgraphClient} = require('./model/dgraph')
const any = require('./model/any')

class ChannelHandler {
  constructor () {
    this.server = null
    this.ajv = new Ajv({allErrors: true})
    this._notificationHandlers = {}
    this._dgraphService = null
  }

  init (scServer) {
    this.server = scServer
  }

  start () {
    modelSubscriptions.addListener('publication', this._onPublicationChange, this)
    // modelSubscriptions.addListener('activity', this._onActivityChange, this)
  }

  registerNotificationHandler (type, handler) {
    logger.debug('registering notification handler for content type: ' + type)
    this._notificationHandlers[type] = handler
  }

  // _onActivityChange (modelChange) {
  //   switch (modelChange.type) {
  //     case proto.dn.ChangeType.UPDATE:
  //       // updated activity, publish on all channels
  //       const publications = await this.pubModel.filter({'activityId': activity.id}).run()
  //       publications.forEach(pub => {
  //         logger.debug('updated activity on channel %s: %s', pub.channelId, activity.id)
  //         let message = this._mergePublication(activity, pub)
  //         this.server.exchange.publish(pub.channelId, {a: 'u', c: message})
  //       })
  //       break
  //   }
  // }

  async _onPublicationChange (modelChange) {
    const publication = modelChange.object[modelChange.object.content]
    if (!publication.channel.id) {
      publication.channel = await this.__getObject(publication.channel.uid)
    }
    if (!publication.actor.username || !publication.actor.name || !publication.actor.color) {
      publication.actor = await this.__getObject(publication.actor.uid)
    }
    logger.debug('publishing on channel %s: %s', publication.channel.id, JSON.stringify(modelChange, null, 2))
    const message = proto.dn.ChannelModel.encode(proto.dn.ChannelModel.fromObject(modelChange)).finish()
    this.server.exchange.publish(publication.channel.id, message)
  }

  validate (message) {
    if (!this.validateActivity) {
      this.validateActivity = this.ajv.compile(schemaHandler.getSchema('Activity'))
    }
    return this.validateActivity(message)
  }

  async getPublication (uid) {
    const query = `query read($a: string){
        object(func: uid($a)) @filter(eq(baseName, "Publication")) {
          uid
          baseName
          activity {
            uid
          }
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: uid})
    return res.getJson().object[0]
  }

  async publish (authToken, channelUid, message) {
    let actorId
    if (authToken === UUID) {
      actorId = message.actorId
      delete message.actorId
    } else {
      actorId = authToken.user
    }
    if (typeof message === 'string') {
      // publish existing message in channel
      message = await this.getPublication(message)
      if (!message) {
        logger.error('invalid publication id given:', message)
        return false
      }
      message = message.activity[0]
    } else {
      const type = message.type
      delete message.type
      // only allow valid activities to be published
      if (!this.validate({content: message, type: type})) {
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

      // convert into content<Any> schema
      const messageType = proto.plugins[type].Payload
      message = {
        content: {
          type_url: any.TYPE_URL_TEMPLATE.replace('$ID', type),
          value: messageType.encode(messageType.fromObject(message)).finish()
        }
      }
    }

    if (!this._dgraphService) {
      this._dgraphService = require('./model/dgraph').dgraphService
    }
    const publication = {
      content: 'publication',
      publication: {
        channel: {uid: channelUid},
        activity: message,
        actor: {uid: actorId}
      }
    }
    const res = await this._dgraphService.createObject(authToken, publication)
    if (res.code === 0) {
      return true
    } else {
      logger.error('error publishing in channel ' + channelUid + ':' + res.message)
    }
  }

  async __getObject (uid) {
    if (!this._dgraphService) {
      this._dgraphService = require('./model/dgraph').dgraphService
    }
    const obj = await this._dgraphService.getObject(UUID, {uid: uid})
    return obj[obj.content]
  }

  async sendNotification (authToken, publication) {
    logger.debug('sendNotification for publication')
    // load whats missing
    if (!publication.channel.id || !publication.channel.title) {
      publication.channel = await this.__getObject(publication.channel.uid)
    }
    const actor = await this.__getObject(authToken.user)

    let options = {
      image: 'www/build-output/resource/app/App-Logo.png',
      channelId: publication.channel.id,
      style: 'inbox',
      summaryText: i18n.__({
        phrase: 'There are %n% new messages',
        locale: actor.locale || 'en'
      })
    }

    if (this._notificationHandlers.hasOwnProperty(publication.activity.content.type_url)) {
      const handler = this._notificationHandlers[publication.activity.content.type_url]
      const message = publication.activity.content.value
      let {phrase, content} = handler(message)

      if (content) {
        if (content.length > 40) {
          content = content.substring(0, 40) + '...'
        }
        pushNotifications.publish(publication.channel.id, i18n.__({
          phrase: phrase,
          locale: actor.locale || 'en'
        }, publication.channel.title), content, options)
      }
    } else {
      logger.error('no notification handler registered for content type:' + publication.activity.content.type_url)
    }
  }
}

const channelHandler = new ChannelHandler()

module.exports = channelHandler
