/**
 * Provides a proxy object for RPC calls to the backend.
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.io.Rpc', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    __proxy: null,
    __socket: null,

    /**
     * RPCs need a socket to work, so before the first RPC the socket must be provided
     * @param socket
     */
    setSocket: function (socket) {
      this.__socket = socket
    },

    /**
     * Returns the proxy object for RPC calls, which can be used to trigger an RPC.
     * @returns {Proxy}
     */
    getProxy: function () {
      if (!this.__proxy) {
        this.__proxy = new Proxy({}, {
          get: function (rcvr, name) {
            return function () {
              const args = qx.lang.Array.fromArguments(arguments)
              qx.log.Logger.debug(this, 'invoking RPC: ' + name + '(' + args + ')')
              return this.__socket.wampSend.call(this.__socket, name, args)
            }.bind(this)
          }.bind(this)
        })
      }
      return this.__proxy
    }
  }
})
