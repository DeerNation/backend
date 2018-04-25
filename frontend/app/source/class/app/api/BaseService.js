qx.Class.define('app.api.BaseService', {
  extend: qx.core.Object,
  type: 'abstract',

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (socket, metadata) {
    this.base(arguments)
    this.setSocket(socket)

    if (metadata) {
      this.setMetadata(metadata)
    }

    app.api.GrpcClient.getInstance().registerService(this)
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties: {
    socket: {
      check: 'app.io.Socket',
      init: null
    },

    metadata: {
      check: 'Object',
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members: {

    _call: function (payload, serviceDefinition) {
      const args = qx.lang.Array.fromArguments(arguments, 2)
      const config = {
        request: payload,
        metadata: this.__metadata
        // debug: qx.core.Environment.get('qx.debug')
      }
      const socket = this.getSocket()
      if (serviceDefinition.responseStream === true) {
        // streaming response
        let context = null
        let callback
        if (typeof args[args.length - 1] === 'object') {
          context = args.pop()
        }
        if (typeof args[args.length - 1] === 'function') {
          callback = args.pop()
        }
        else {
          throw Error('no callback defined')
        }
        if (config.request === callback) {
          throw Error('no payload defined')
        }
        return socket.invoke(serviceDefinition, Object.assign(config, {
          onMessage: callback.bind(context)
        }))
      } else {
        return socket.unary(serviceDefinition, config)
      }
    }
  }
})
