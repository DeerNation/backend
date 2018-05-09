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

const gcm = require('node-gcm')
const {dgraphClient} = require('../model/dgraph')
const logger = require('../logger')(__filename)
const {fcmKey} = require('../credentials')
const request = require('request-promise')

class PushNotification {
  constructor () {
    this.__apiKey = fcmKey
    this.__service = new gcm.Sender(this.__apiKey)
    this.__requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'key=' + fcmKey
    }
    this.__serverTopicPrefix = null
  }

  async __getUserTokens (userId) {
    const query = `query read($a: string) {
        actor(func: uid($a)) @normalize {
          ~actor @filter(has(tokenId)) {
            tokenId: tokenId
          }
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: Array.isArray(userId) ? userId.join(', ') : userId})
    return res.getJson().actor.map(x => x.tokenId)
  }

  /**
   * Subscibe a user to a topic
   * @param userId {String} user ID
   * @param topic {String} topic to subscribe to
   */
  subscribeUserToTopic (userId, topic) {
    return this.__getUserTokens(userId).then((tokens) => {
      let promises = []
      tokens.forEach(token => {
        promises.push(this.addSubscription(token, topic))
      })
      return Promise.all(promises)
    })
  }

  /**
   * Unsubscibe a user from a topic
   * @param userId {String} user ID
   * @param topic {String} topic to unsubscribe from
   */
  unsubscribeUserFromTopic (userId, topic) {
    return this.__getUserTokens(userId).then((tokens) => {
      let promises = []
      tokens.forEach(token => {
        promises.push(this.deleteSubscription(token, topic))
      })
      return Promise.all(promises)
    })
  }

  /**
   * Subscribe a client (identified by its registration token) to a topic
   * @param token {String} registration token
   * @param topic {String} topic to subscribe to
   */
  addSubscription (token, topic) {
    return request({
      method: 'POST',
      url: 'https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/' + topic,
      headers: Object.assign({
        'Content-length': 0
      }, this.__requestHeaders)
    }).catch(error => {
      if (error) {
        logger.error('Error subscribing to topic %s: %s', topic, error)
      }
    })
  }

  /**
   * Unsubscribe a client (identified by its registration token) from a topic
   * @param token {String} registration token
   * @param topic {String} topic to unsubscribe from
   */
  deleteSubscription (token, topic) {
    return request({
      method: 'DELETE',
      url: 'https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/' + topic,
      headers: Object.assign({
        'Content-length': 0
      }, this.__requestHeaders)
    }).catch(error => {
      if (error) {
        logger.error('Error subscribing to topic %s: %s', topic, error)
      }
    })
  }

  __getAppInstanceInfos (token) {
    return request({
      method: 'GET',
      json: true,
      url: 'https://iid.googleapis.com/iid/info/' + token + '?details=true',
      headers: Object.assign({
        'Content-length': 0
      }, this.__requestHeaders)
    })
  }

  /**
   * Synchronize FCM topic subscriptions and channel subscriptions
   * @param userId {String} user id
   * @param serverId {String} server identifier used as topic prefix
   */
  async syncTopicSubscriptions (userId, serverId) {
    // try {
    //   this.__serverTopicPrefix = serverId ? serverId + '-' : ''
    //   logger.debug('using %s as topic prefix', this.__serverTopicPrefix)
    //   let firebases = await schema.getModel('Firebase').filter({actorId: userId}).run()
    //   let subscriptions = await schema.getModel('Subscription').filter({actorId: userId}).run()
    //   firebases.forEach(async (firebase) => {
    //     let infos = await this.__getAppInstanceInfos(firebase.token)
    //     firebase.infos = infos
    //     firebase.save()
    //     let subscribedTopics = []
    //     if (infos.hasOwnProperty('rel') && infos.rel.hasOwnProperty('topics')) {
    //       subscribedTopics = Object.keys(infos.rel.topics)
    //     }
    //
    //     // check type and settings
    //     let type = infos.platform === 'WEBPUSH' ? 'desktopNotification' : 'mobileNotification'
    //     let clientSubscriptions = subscriptions.filter(x => x[type] && x[type].type !== 'none').map(x => this.__serverTopicPrefix + x.channelId)
    //
    //     logger.debug('user %s is subscribed to %s', userId, clientSubscriptions)
    //     let add = clientSubscriptions.filter(x => !subscribedTopics.includes(x))
    //     let remove = subscribedTopics.filter(x => !clientSubscriptions.includes(x))
    //     logger.debug('add subscriptions: %s, remove subscriptions: %s', add, remove)
    //     remove.forEach(this.deleteSubscription.bind(this, firebase.token))
    //     add.forEach(this.addSubscription.bind(this, firebase.token))
    //   })
    // } catch (e) {
    //   logger.debug('Sync error: %s', e)
    // }
  }

  /**
   * Send message to FCM receiver
   * @param userIds {Array|String} Array of or single user id the message sould be send to
   * @param title {String} title of the message
   * @param content {String} body of the message
   * @param options {Map} additional options that should be added to the message
   */
  send (userIds, title, content, options) {
    if (!Array.isArray(userIds)) {
      userIds = [userIds]
    }
    logger.debug('trying to send notification with title: %s to %s', title, userIds)
    // collect receivers
    this.__getUserTokens(userIds).then((receivers) => {
      logger.debug('FCM tokens: %s', receivers)
      let message = this.__createMessage(title, content, options)
      this.__push(message, { registrationTokens: receivers })
    }).catch((err) => {
      logger.error(err)
      throw Error('no registration tokens found tor the given receivers')
    })
  }

  /**
   * Publish message in topic on FCM
   * @param topic {String}
   * @param title {String}
   * @param content {String}
   * @param options {Map}
   */
  publish (topic, title, content, options) {
    let message = this.__createMessage(title, content, options)
    this.__push(message, { to: '/topics/' + this.__serverTopicPrefix + topic })
  }

  __createMessage (title, content, options) {
    let message = new gcm.Message()
    message.addData('title', title)
    message.addData('body', content)
    if (options) {
      Object.keys(options).forEach(key => {
        message.addData(key, options[key])
      })
    }
    return message
  }

  __push (message, receiver) {
    this.__service.send(message, receiver, (err, response, rec) => {
      if (err) {
        logger.error('Error sending notification: %o', err)
      } else if (response.failure) {
        let errors = response.results.map(x => x.error)
        logger.error('Error sending notification: %o', errors)
      } else {
        logger.info('Notification sent: %o', response)
      }
    })
  }
}

const push = new PushNotification()

module.exports = push
