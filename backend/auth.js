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
 * auth
 *
 * @author tobiasb
 * @since 2018
 */
const logger = require('./logger')(__filename)
const config = require('./config')
const i18n = require('i18n')
const acl = require('./acl')
const {dgraphService} = require('./model/dgraph')

module.exports = function (socket, scServer, callback) {
  socket.on('login', async function (credentials, respond) {
    logger.debug('login request for actor %s received', credentials.username)
    try {
      await acl.check(null, config.domain + '.rpc.login', acl.action.EXECUTE)

      const uid = await dgraphService.authenticate(credentials.username, credentials.password)
      if (uid !== false) {
        // This will give the client a token so that they won't
        // have to login again if they lose their connection
        // or revisit the app at a later time.
        socket.setAuthToken({user: uid})
        callback && callback(uid)
        respond()
      } else {
        // Passing string as first argument indicates error
        respond('Login failed')
      }
    } catch (e) {
      respond(e)
    }
  })

  socket.on('logout', function (data, respond) {
    logger.debug('logout request for actor %s received', socket.getAuthToken().user)
    socket.deauthenticate()
    logger.debug('removing subscriptions to %o', socket.subscriptions())
    socket.kickOut()
    // TODO: What else needs to be cleaned up / unsubscribed?
    respond()
  })

  scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, async function (req, next) {
    try {
      await acl.check(req.socket.authToken, req.channel, acl.action.ENTER)
      next && next()
    } catch (e) {
      logger.error(e)
      next && next(i18n.__('You are not authorized to subscribe to #%s', req.channel))
    }
  })

  scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, async function (req, next) {
    try {
      await acl.check(req.socket.authToken, req.channel, acl.action.PUBLISH)
      next && next()
    } catch (e) {
      next && next(i18n.__('You are not authorized to publish in #%s', req.channel))
    }
  })
}
