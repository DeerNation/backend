/**
 * RPC registry that hold all registered RPCs
 *
 * @author tobiasb
 * @since 2018
 */
const WAMPServer = require('wamp-socket-cluster/WAMPServer')
const dbModule = require('./db')

class RpcServer {
  constructor () {
    this.rpcServer = new WAMPServer()
    this.registerRPCEndpoints(dbModule)
    this.socket = null
  }

  upgradeToWAMP (socket) {
    this.socket = socket
    this.rpcServer.upgradeToWAMP(socket)
  }

  registerRPCEndpoints (endpoints) {
    let wrappedEndpoints = {}
    Object.keys(endpoints).forEach(methodName => {
      const entry = endpoints[methodName]
      let context = this
      let func = entry
      if (typeof entry === 'object') {
        if (entry.hasOwnProperty('context')) {
          context = entry.context
          func = entry.func
        }
      }
      wrappedEndpoints[methodName] = this._wrapper.bind(this, func, context)
    })
    this.rpcServer.registerRPCEndpoints(wrappedEndpoints)
  }

  _wrapper (func, context, data, callback) {
    try {
      // ACL check

      if (data) {
        data.unshift(this.socket.getAuthToken())
      } else {
        data = [this.socket.getAuthToken()]
      }
      let res = func.apply(context, data)
      Promise.resolve(res).then(pres => {
        callback(null, pres)
      })
    } catch (e) {
      callback(e.toString())
    }
  }
}

const rpcServer = new RpcServer()

module.exports = rpcServer
