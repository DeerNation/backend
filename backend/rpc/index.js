/**
 * RPC registry that hold all registered RPCs
 *
 * @author tobiasb
 * @since 2018
 */
const WAMPServer = require('wamp-socket-cluster/WAMPServer')
const dbModule = require('./db')

const rpcServer = new WAMPServer()
rpcServer.registerRPCEndpoints(dbModule)

module.exports = rpcServer