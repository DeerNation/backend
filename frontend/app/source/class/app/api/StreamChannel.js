/**
 * StreamChannel for streaming gRPC calls.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.api.StreamChannel', {
  extend: qx.core.Object,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (socket, service, config) {
    this.base(arguments)
    this._socket = socket
    this._service = service
    this._config = config

    this._initialize()
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    ID: 0
  },

  /*
  ******************************************************
    EVENTS
  ******************************************************
  */
  events: {
    'error': 'qx.event.type.Data',
    'message': 'qx.event.type.Data',
    'close': 'qx.event.type.Event'
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _socket: null,
    _service: null,
    _config: null,
    _channelName: null,

    _initialize: function () {
      // create a channel
      this._channelName = '/' + this._service.service.serviceName + '/' + this._service.methodName + '#' + app.api.StreamChannel.ID++

      // send initial request to server
      this._socket.send(qx.lang.Json.stringify({startStreamRpc: this._channelName, data: this._config.request.serializeBinary()}))

      // subscribe to channel
      this._socket.on(this._channelName, this._onHandler.bind(this))
    },

    _onHandler: function (res) {
      this.fireDataEvent('message', this._service.responseType.deserializeBinary(res.data))
    },

    close: function () {
      this._socket.off(this._channelName, this._onHandler.bind(this))
      this._socket.send(qx.lang.Json.stringify({stopStreamRpc: this._channelName}))
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    this.close()
    this._socket = null
    this._service = null
    this._config = null
  }
})
