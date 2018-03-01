/**
 * RPC registry that hold all registered RPCs
 *
 * @author tobiasb
 * @since 2018
 */
const WAMPServer = require('wamp-socket-cluster/WAMPServer')
const dbModule = require('./db')
const acl = require('../acl')
const config = require('../config')

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

  async _wrapper (func, context, data, callback) {
    try {
      // ACL check
      await acl.check(this.socket.getAuthToken(), config.domain + '.rpc.' + func.name.replace('bound ', ''), acl.action.EXECUTE)
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

rpcServer.registerRPCEndpoints({
  getAllowedActions: acl.getAllowedActions.bind(acl),
  check: acl.check.bind(acl),
  getAllowedActionsForRole: acl.getAllowedActionsForRole.bind(acl)
})

module.exports = rpcServer
