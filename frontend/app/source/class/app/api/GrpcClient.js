/**
 * GrpcClient
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.api.GrpcClient', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.__services = {}
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __services: null,

    upgradeToGrpcClient: function (socket) {
      if (socket.unary && socket.invoke) {
        return socket
      }

      // no streaming RPC
      socket.unary = (service, config) => {
        return new qx.Promise((resolve, reject) => {
          socket.emit('/' + service.service.serviceName + '/' + service.methodName, config.request.serializeBinary(), (err, res) => {
            if (err) {
              reject(err)
            } else if (res.data) {
              resolve(service.responseType.deserializeBinary(res.data))
            } else {
              resolve()
            }
          })
        })
      }

      // streaming RPC
      socket.invoke = (service, config) => {
        return new app.api.StreamChannel(socket, service, config)
      }
    },

    registerService: function (service) {
      this.__services[service.serviceName] = service
    }
  }

})
