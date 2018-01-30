/**
 * Rpc
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.io.Rpc', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    send: function() {
      var self = app.io.Rpc.getInstance();
      return self.send.apply(self, qx.lang.Array.fromArguments(arguments))
    }
  },


  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    socket: {
      init: null
    }
  },


  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    send: function() {
      var args = qx.lang.Array.fromArguments(arguments);
      return this.getSocket().wampSend.apply(this.getSocket(), args)
    }
  }
})