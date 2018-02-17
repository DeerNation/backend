/**
 * Firebase
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.io.Firebase', {
  extend: app.io.AbstractNotification,
  type: 'singleton',

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
        this.debug('Message received. ', payload)
        console.log(payload)
        // this.appendMessage(payload)
      })
    },

    _onRefreshToken: function () {
      this.__messaging.getToken()
        .then((refreshedToken) => {
          this.debug('Token refreshed.')
          // Indicate that the new Instance ID token has not yet been sent to the
          // app server.
          this.setTokenSentToServer(false)
          // Send Instance ID token to app server.
          this.setToken(refreshedToken)
          this.reset()
        })
        .catch((err) => {
          this.debug('Unable to retrieve refreshed token ', err)
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
            this.debug('No Instance ID token available. Request permission to generate one.')
            // Show permission UI.
            this.setTokenSentToServer(false)
            this.requestPermission()
          }
        })
        .catch((err) => {
          this.debug('An error occurred while retrieving token. ', err)
          this.error('Error retrieving Instance ID token. ', err)
          this.setTokenSentToServer(false)
        })
    },

    requestPermission: function () {
      this.debug('Requesting permission...')

      // [START request_permission]
      this.__messaging.requestPermission()
        .then(() => {
          this.debug('Notification permission granted.')
          this.reset()
        })
        .catch((err) => {
          this.error('Unable to get permission to notify.', err)
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
              this.debug('Token deleted.')
              this.setTokenSentToServer(false)
              this.resetToken()
            })
            .catch((err) => {
              this.error('Unable to delete token. ', err)
            })
          // [END delete_token]
        })
        .catch((err) => {
          this.error('Error retrieving Instance ID token. ', err)
        })
    }
  }
})
