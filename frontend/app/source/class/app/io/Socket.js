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
    this.connect()

    // eslint-disable-next-line
    this.__wampClient = new wampSocketCluster()
    this.__wampClient.upgradeToWAMP(this.__socket)

    app.io.Rpc.setSocket(this.__socket)

    this.__socket.on('error', function (err) {
      this.error('Socket error - ' + err)
    }.bind(this))

    this.__socket.on('authenticate', function () {
      this.setAuthenticated(true)
      app.Model.getInstance().init()
    }.bind(this))

    this.__socket.on('deauthenticate', function () {
      this.setAuthenticated(false)
      app.Model.getInstance().resetActor()
      app.Model.getInstance().init()
    }.bind(this))

    this.__socket.on('connect', function () {
      this.info('CONNECTED', this.__socket.authState === this.__socket.AUTHENTICATED)
      this.setAuthenticated(this.__socket.authState === this.__socket.AUTHENTICATED)
      if (!this.isAuthenticated()) {
        app.Model.getInstance().init()
      }
      app.io.GraphQL.getInstance().test()
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

    connect: function () {
      if (this.__socket && this.__socket.state !== this.__socket.CLOSED) {
        this.__socket.destroy()
      }
      // Initiate the connection to the server
      this.__socket = socketCluster.create(app.Config.socket)
    },

    // property apply
    _applyAuthenticated: function (value, old) {
      console.log(this.toHashCode(), 'authenticated: ', value)
      if (value && this.__loginDialog) {
        this.__loginDialog.hide()
      }
    },

    login: function () {
      return new Promise((resolve, reject) => {
        if (!this.isAuthenticated()) {
          this.__loginDialog = new dialog.Login({
            checkCredentials: function (username, password, callback) {
              this.__socket.emit('login', {username: username, password: password}, (err) => {
                if (err) {
                  this.error(err)
                  resolve(false)
                } else {
                  this.debug('Login request successfully send')
                  resolve(true)
                }
                callback(err)
              })
            }.bind(this),
            text: qx.locale.Manager.tr('Please login')
          })
          this.__loginDialog.show()
        } else if (this.__loginDialog) {
          this.__loginDialog.hide()
          resolve(true)
        } else {
          resolve(true)
        }
      })
    },

    logout: function () {
      this.__socket.emit('logout', (err) => {
        if (err) {
          this.error(err)
        } else {
          this.debug('Logout successful')
          app.Model.getInstance().resetActor()
        }
      })
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

    unsubscribe: function (channelId) {
      this.__socket.unsubscribe(channelId)
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

    emit: function (channel, payload, callback) {
      return this.__socket.emit(channel, payload, callback)
    },

    publish: function (channel, payload) {
      return this.__socket.publish(channel, payload)
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
      this.__socket.destroy()
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
