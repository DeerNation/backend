/**
 * auth
 *
 * @author tobiasb
 * @since 2018
 */
const shajs = require('sha.js')

module.exports = function(socket, scServer) {
  socket.on('login', function (credentials, respond) {
    console.log(credentials)
    if (credentials.username === 'admin' && credentials.password === 'tester') {
      // TODO remove this later
      respond()
      socket.setAuthToken({user: 'admin'});
    } else {
      const passwordHash = shajs('sha512').update(credentials.password).digest('hex');

      scServer.thinky.r.table('User').filter({username: credentials.username}).run((err, results) => {
        const userRow = results[0];
        let isValidLogin = userRow && userRow.password === passwordHash;

        if (isValidLogin) {
          respond();

          // This will give the client a token so that they won't
          // have to login again if they lose their connection
          // or revisit the app at a later time.
          socket.setAuthToken({user: userRow.id});
        } else {
          // Passing string as first argument indicates error
          respond('Login failed');
        }
      });
    }
  });

  scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, function (req, next) {
    const authToken = req.socket.authToken;

    if (authToken && authToken.user) {
      next();
    } else {
      next('You are not authorized to subscribe to ' + req.channel);
    }
  });
}
