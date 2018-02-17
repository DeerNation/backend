/**
 * Firebase
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.io.Firebase', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    token: {
      check: 'String',
      nullable: true,
      apply: '_applyToken'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __messaging: null,

    init: function () {
      firebase.initializeApp(app.Config.firebaseConfig)
      this.__messaging = firebase.messaging()
      app.io.ServiceWorkerHandler.getInstance().getWorkerRegistration().then(reg => {
        this.__messaging.useServiceWorker(reg)
        this.reset()
      })

      this.__messaging.onTokenRefresh(this._onRefreshToken.bind(this))

      // Handle incoming messages. Called when:
      // - a message is received while the app has focus
      // - the user clicks on an app notification created by a service worker
      //   `messaging.setBackgroundMessageHandler` handler.
      this.__messaging.onMessage((payload) => {
        qx.log.Logger.debug(this, 'Message received. ', payload)
        console.log(payload)
        // this.appendMessage(payload)
      })
    },

    // property apply
    _applyToken: function (value, old) {
      if (old && !value) {
        // delete old token
        app.io.Rpc.getProxy().setFirebaseToken(value, old)
      }
      if (value) {
        if (!this.isTokenSentToServer()) {
          qx.log.Logger.info(this, 'Sending token to server...')
          app.io.Rpc.getProxy().setFirebaseToken(value, old)
          this.setTokenSentToServer(true)
        } else {
          qx.log.Logger.info(this, 'Token already sent to server so won\'t send it again ' +
            'unless it changes')
        }
      }
    },

    _onRefreshToken: function () {
      this.__messaging.getToken()
        .then((refreshedToken) => {
          qx.log.Logger.debug(this, 'Token refreshed.')
          // Indicate that the new Instance ID token has not yet been sent to the
          // app server.
          this.setTokenSentToServer(false)
          // Send Instance ID token to app server.
          this.setToken(refreshedToken)
          this.reset()
        })
        .catch((err) => {
          qx.log.Logger.debug(this, 'Unable to retrieve refreshed token ', err)
        })
    },

    reset: function () {
      // [START get_token]
      // Get Instance ID token. Initially this makes a network call, once retrieved
      // subsequent calls to getToken will return from cache.
      this.__messaging.getToken()
        .then((currentToken) => {
          if (currentToken) {
            this.setToken(currentToken)
          } else {
            // Show permission request.
            qx.log.Logger.debug(this, 'No Instance ID token available. Request permission to generate one.')
            // Show permission UI.
            this.setTokenSentToServer(false)
            this.requestPermission()
          }
        })
        .catch((err) => {
          qx.log.Logger.debug(this, 'An error occurred while retrieving token. ', err)
          qx.log.Logger.error(this, 'Error retrieving Instance ID token. ', err)
          this.setTokenSentToServer(false)
        })
    },

    isTokenSentToServer: function () {
      return qx.bom.Storage.getLocal().getItem('sentToServer') === '1'
    },

    setTokenSentToServer: function (sent) {
      qx.bom.Storage.getLocal().setItem('sentToServer', sent ? '1' : '0')
    },

    requestPermission: function () {
      qx.log.Logger.debug(this, 'Requesting permission...')

      // [START request_permission]
      this.__messaging.requestPermission()
        .then(() => {
          qx.log.Logger.debug(this, 'Notification permission granted.')
          this.reset()
        })
        .catch((err) => {
          qx.log.Logger.error(this, 'Unable to get permission to notify.', err)
        })
      // [END request_permission]
    },

    deleteToken: function () {
      // Delete Instance ID token.
      // [START delete_token]
      this.__messaging.getToken()
        .then((currentToken) => {
          this.__messaging.deleteToken(currentToken)
            .then(() => {
              qx.log.Logger.debug(this, 'Token deleted.')
              this.setTokenSentToServer(false)
              this.resetToken()
            })
            .catch((err) => {
              qx.log.Logger.error(this, 'Unable to delete token. ', err)
            })
          // [END delete_token]
        })
        .catch((err) => {
          qx.log.Logger.error(this, 'Error retrieving Instance ID token. ', err)
        })
    }
  }
})
