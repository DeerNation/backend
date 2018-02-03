/**
 * auth
 *
 * @author tobiasb
 * @since 2018
 */
const bcrypt = require('bcrypt')
const logger = require('./logger')(__filename)
const i18n = require('i18n')

module.exports = function (socket, scServer) {
  socket.on('login', function (credentials, respond) {
    logger.debug('login request for actor %s received', credentials.username)

    scServer.thinky.r.table('Actor').filter({username: credentials.username}).run((err, results) => {
      const userRow = results[0]
      let isValidLogin = userRow && bcrypt.compareSync(credentials.password, userRow.password)

      if (isValidLogin) {
        respond()

        // This will give the client a token so that they won't
        // have to login again if they lose their connection
        // or revisit the app at a later time.
        socket.setAuthToken({user: userRow.id})
      } else {
        // Passing string as first argument indicates error
        respond('Login failed')
      }
    })
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
