/**
 * Socket
 *
 * @author tobiasb
 * @since 2018
 * @ignore(socketcluster)
 */

qx.Class.define('app.io.Socket', {
  extend: qx.core.Object,
  type: "singleton",

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function() {
    this.base(arguments);
    this.__channels = [];
    this.__queuedSubscriptions = [];
    // Initiate the connection to the server
    this.__socket = socketCluster.connect();

    this.__socket.on('error', function (err) {
      this.error('Socket error - ' + err);
    }.bind(this));

    this.__socket.on('connect', function () {
      this.info('CONNECTED, logging in');
      this.__socket.emit('login', {username: 'admin', password: 'tester'}, (err) => {
        if (err) {
          this.error(err)
        } else {
          this.info('LOGGED IN')
          this.setAuthenticated(true)
        }
      })
    }.bind(this));

    this.__socket.on('rand', function (data) {
      this.debug('RANDOM STREAM: ' + data.rand);
    }.bind(this));
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    authenticated: {
      check: "Boolean",
      init: false,
      event: "changeAuthenticated"
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

    subscribe: function(channelId) {
      return new qx.Promise((resolve, reject) => {
        if (this.isAuthenticated()) {
          let channel = this.__socket.subscribe(channelId);
          channel.on('subscribeFail', this._onSubscribeError.bind(this))
          resolve(channel);
        } else {
          let lid = this.addListener('changeAuthenticated', (ev) => {
            if (ev.getData() === true) {
              let channel = this.__socket.subscribe(channelId);
              channel.on('subscribeFail', this._onSubscribeError.bind(this))
              resolve(channel);
              this.removeListenerById(lid);
            }
          })
        }
      })
    },

    emit: function(channel, payload) {
      return this.__socket.emit(channel, payload);
    },

    _onSubscribeError: function(err, channelName) {
      this.error("Error on subscribing channel", channelName, ":", err)
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function() {
    this.__channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.__channels = []
  }
});