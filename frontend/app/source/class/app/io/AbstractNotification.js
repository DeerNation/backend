/**
 * AbstractNotification
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.io.AbstractNotification', {
  extend: qx.core.Object,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    token: {
      check: 'String',
      nullable: true,
      apply: '_applyToken'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyToken: function (value, old) {
      if (old && !value) {
        // delete old token
        this.__sendToBackend(value, old)
      }
      if (value) {
        if (!this.isTokenSentToServer()) {
          this.info('Sending token to server...')
          this.__sendToBackend(value, old)
        } else {
          this.info('Token already sent to server so won\'t send it again ' +
            'unless it changes')
        }
      }
    },

    __sendToBackend: function (value, old) {
      if (app.io.Socket.getInstance().isAuthenticated()) {
        app.io.Rpc.getProxy().setFirebaseToken(value, old)
        this.setTokenSentToServer(true)
      } else {
        const lid = app.io.Socket.getInstance().addListener('changeAuthenticated', ev => {
          if (ev.getData()) {
            app.io.Rpc.getProxy().setFirebaseToken(value, old)
            app.io.Socket.getInstance().removeListenerById(lid)
            this.setTokenSentToServer(true)
          }
        })
      }
    },

    isTokenSentToServer: function () {
      return qx.bom.Storage.getLocal().getItem('sentToServer') === '1'
    },

    setTokenSentToServer: function (sent) {
      qx.bom.Storage.getLocal().setItem('sentToServer', sent ? '1' : '0')
    }
  }
})
