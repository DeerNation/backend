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
      const config = {
        request: payload,
        metadata: this.__metadata
        // debug: qx.core.Environment.get('qx.debug')
      }
      if (!config.request) {
        throw Error('no payload defined')
      }
      const socket = this.getSocket()
      if (serviceDefinition.responseStream === true) {
        // streaming response
        return socket.invoke(serviceDefinition, config)
      } else {
        return socket.unary(serviceDefinition, config)
      }
    }
  }
})
