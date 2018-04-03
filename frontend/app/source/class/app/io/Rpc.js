/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

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
              return this.__socket.wampSend(name, args)
            }.bind(this)
          }.bind(this)
        })
      }
      return this.__proxy
    }
  }
})
