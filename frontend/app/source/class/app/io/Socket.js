/**
 * Socket
 *
 * @author tobiasb
 * @since 2018
 * @ignore(socketcluster,wampSocketCluster,socketCluster.connect,socketCluster.destroy)
 */

qx.Class.define('app.io.Socket', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.__channels = []
    this.__queuedSubscriptions = []
    // Initiate the connection to the server
    this.__socket = socketCluster.connect(app.Config.socket)

    // eslint-disable-next-line
    this.__wampClient = new wampSocketCluster()
    this.__wampClient.upgradeToWAMP(this.__socket)

    app.io.Rpc.setSocket(this.__socket)

    this.__socket.on('error', function (err) {
      this.error('Socket error - ' + err)
    }.bind(this))

    this.__socket.on('authenticate', function () {
      this.setAuthenticated(true)
    }.bind(this))

    this.__socket.on('deauthenticate', function () {
      this.setAuthenticated(false)
    }.bind(this))

    this.__socket.on('connect', function () {
      this.info('CONNECTED', this.__socket.authState === this.__socket.AUTHENTICATED)
      this.setAuthenticated(this.__socket.authState === this.__socket.AUTHENTICATED)
    }.bind(this))

    this.__socket.on('rand', function (data) {
      this.debug('RANDOM STREAM: ' + data.rand)
    }.bind(this))
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    authenticated: {
      check: 'Boolean',
      init: false,
      event: 'changeAuthenticated',
      apply: '_applyAuthenticated'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __socket: null,
    __channels: null,
    __queuedSubscriptions: null,
    __loginDialog: null,
    __wampClient: null,

    // property apply
    _applyAuthenticated: function (value, old) {
      console.log(this.toHashCode(), 'authenticated: ', value)
      if (!value) {
        if (!this.__loginDialog) {
          this.__loginDialog = new dialog.Login({
            checkCredentials: function (username, password, callback) {
              this.__socket.emit('login', {username: username, password: password}, (err) => {
                if (err) {
                  this.error(err)
                } else {
                  this.debug('Login request successfully send')
                }
                callback(err)
              })
            }.bind(this),
            text: qx.locale.Manager.tr('Please login')
          })
        }
        this.__loginDialog.show()
      } else if (this.__loginDialog) {
        this.__loginDialog.hide()
      }
    },

    subscribe: function (channelId) {
      return new qx.Promise((resolve, reject) => {
        if (this.isAuthenticated()) {
          let channel = this.__socket.subscribe(channelId)
          channel.on('subscribeFail', this._onSubscribeError.bind(this, reject, channel))
          resolve(channel)
        } else {
          let lid = this.addListener('changeAuthenticated', (ev) => {
            if (ev.getData() === true) {
              let channel = this.__socket.subscribe(channelId)
              channel.on('subscribeFail', this._onSubscribeError.bind(this, reject, channel))
              resolve(channel)
              this.removeListenerById(lid)
            }
          })
        }
      })
    },

    /**
     * Get the SCChannel object for the given channel name
     * @param name {String} name of the channel to lookup
     * @returns {SCChannel?}
     */
    getScChannel: function (name) {
      if (qx.lang.Type.isString(name)) {
        return this.__socket.channel(name)
      }
      return null
    },

    getAuthToken: function () {
      return this.__socket.authToken
    },

    emit: function (channel, payload) {
      return this.__socket.emit(channel, payload)
    },

    _onSubscribeError: function (promiseReject, channel, err, channelName) {
      channel.off('subscribeFail')
      this.error('Error on subscribing channel', channelName, ':', err)
      promiseReject && promiseReject(err)
    },

    close: function () {
      this.__channels.forEach((channel) => {
        channel.unsubscribe()
      })
      this.__channels = []
      socketCluster.destroy(app.Config.socket)
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    this.close()
    this.__wampClient = null
    this.__socket = null
  }
})
