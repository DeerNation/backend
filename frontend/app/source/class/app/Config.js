/**
 * Config
 *
 * @author tobiasb
 * @since 2018
 */
qx.Class.define('app.Config', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    isApp: !!window.cordova,
    socket: {
      hostname: 'localhost',
      secure: false,
      port: 8000,
      rejectUnauthorized: false // Only necessary during debug if using a self-signed certificate
    },

    channelPrefix: 'hbg.channel.'
  }
})
