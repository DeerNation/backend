/**
 * auth
 *
 * @author tobiasb
 * @since 2018
 */
const bcrypt = require('bcryptjs')
const logger = require('./logger')(__filename)
const i18n = require('i18n')
const acl = require('./acl')

module.exports = function (socket, scServer, callback) {
  socket.on('login', function (credentials, respond) {
    logger.debug('login request for actor %s received', credentials.username)
    try {
      acl.check('rpc|login', acl.actions.EXECUTE)

      scServer.thinky.r.table('Actor').filter({username: credentials.username}).run((err, results) => {
        if (err) {
          logger.error('Error searching Actor: ', err)
        }
        const userRow = results[0]
        let isValidLogin = userRow && bcrypt.compareSync(credentials.password, userRow.password)

        if (isValidLogin) {
          respond()

          // This will give the client a token so that they won't
          // have to login again if they lose their connection
          // or revisit the app at a later time.
          socket.setAuthToken({user: userRow.id})
          callback && callback(userRow.id)
        } else {
          // Passing string as first argument indicates error
          respond('Login failed')
        }
      })
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

  scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, function (req, next) {
    const authToken = req.socket.authToken

    if (authToken && authToken.user) {
      next()
    } else {
      next(i18n.__('You are not authorized to subscribe to #%s', req.channel))
    }
  })
}
