/**
 * grpc
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const logger = require('../logger')(__filename)
const acl = require('../acl')
const config = require('../config')

class GrpcServer {
  constructor () {
    this.socket = null
    this._services = {}
    this._streamHandlers = {}
  }

  upgradeToGrpc (socket) {
    this.socket = socket

    // listen for incoming streamChannel requests
    this.socket.on('raw', (request) => {
      try {
        request = JSON.parse(request)
      } catch (ex) {
        return
      }
      if (request.hasOwnProperty('startStreamRpc')) {
        this._streamHandlers[request.startStreamRpc] = {
          handler: this._onStreamRequest.bind(this, request.startStreamRpc),
          service: this._services[request.startStreamRpc.split('#')[0]]
        }
        this.socket.on(request.startStreamRpc, this._streamHandlers[request.startStreamRpc].handler)
        this._streamHandlers[request.startStreamRpc].handler(request.startStreamRpc, request.data)
      } else if (request.hasOwnProperty('stopStreamRpc')) {
        this.socket.off(request.startStreamRpc, this._streamHandlers[request.startStreamRpc].handler)
        delete this._streamHandlers[request.startStreamRpc]
      }
    })
  }

  /**
   * Add gRPC service handler
   * @param service {Object} service descriptions from proto file
   * @param handler {Object} object that implements the requested methods
   */
  addService (service, handler) {
    Object.keys(service.service).forEach(name => {
      const rpc = service.service[name]
      if (typeof handler[name] === 'function') {
        logger.debug('registering service endpoint ' + name)
        this._services[rpc.path] = Object.assign({callback: handler[name].bind(handler)}, rpc)
        this.socket.on(service.service[name].path, this._onRequest.bind(this, service.service[name].path))
      } else {
        logger.warn('no callback defined for service endpoint ' + name)
      }
    })
  }

  /**
   * Handle incoming gRPC requests
   * @param path {String} gRPC path
   * @param data {Map} Uint8Array as plain Javascript object
   * @param response {Function} response callback function
   * @protected
   */
  async _onRequest (path, data, response) {
    const service = this._services[path]
    const bytes = Uint8Array.from(Object.values(data))
    await acl.check(this.socket.getAuthToken(), config.domain + '.rpc.' + service.originalName, acl.action.EXECUTE)
    logger.debug('executing ' + path)
    const result = await service.callback(this.socket.getAuthToken(), service.requestDeserialize(bytes))
    response(null, service.responseSerialize(result))
  }

  async _onStreamRequest (streamChannel, data) {
    const service = this._streamHandlers[streamChannel].service
    const bytes = Uint8Array.from(Object.values(data))
    await acl.check(this.socket.getAuthToken(), config.domain + '.rpc.' + service.originalName, acl.action.EXECUTE)
    logger.debug('executing ' + streamChannel)
    const result = await service.callback(
      this.socket.getAuthToken(),
      service.requestDeserialize(bytes),
      this.__respond.bind(this, streamChannel, service.responseSerialize)
    )
    this.socket.emit(streamChannel, service.responseSerialize(result))
  }

  __respond (streamChannel, serializer, result) {
    this.socket.emit(streamChannel, serializer(result))
  }
}

const grpcServer = new GrpcServer()

module.exports = grpcServer
