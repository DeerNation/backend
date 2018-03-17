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
      rejectUnauthorized: false, // Only necessary during debug if using a self-signed certificate
      // codecEngine: scCodecMinBin
    },

    channelPrefix: 'hbg.channel.',
    crudChannelPrefix: 'crud>',
    target: qx.core.Environment.get('device.type'),

    firebaseConfig: {
      messagingSenderId: '1022981480494'
    },

    /**
     * Adds the current target to the classpath
     * @param path {String} class path
     * @returns {Class}
     */
    getTargetClass: function (path) {
      let newPath = path
      if (this.target !== 'desktop') {
        let parts = path.split('.')
        qx.lang.Array.insertAt(parts, this.target, 1)
        newPath = parts.join('.')
      }
      if (qx.Class.isDefined(newPath)) {
        return qx.Class.getByName(newPath)
      } else {
        throw new Error('Class ' + newPath + ' not defined')
      }
    },

    icons: {
      favorite: '@Material/star',
      noFavorite: '@Material/star_border',
      hide: '@Material/visibility_off',
      show: '@Material/visibility',
      unsubscribe: '@Material/arrow_back',
      subscribe: '@Material/arrow_forward',
      menu: '@Material/more_vert',
      online: '@Material/fiber_manual_record',
      offline: '@Material/stop',
      private: '@Material/lock_outline',
      public: '@Material/public',
      logout: '@Material/exit_to_app',
      smiley: '@Material/face',
      plus: '@Material/add',
      event: '@Material/event',
      delete: '@Material/delete',
      edit: '@Material/mode_edit',
      share: '@Material/share',
      back: '@Material/chevron_left'
    },

    init: function () {
      this.isApp = !!window.cordova
      let storeSocket = qx.bom.Storage.getLocal().getItem('socket')
      if (storeSocket) {
        this.socket = storeSocket
      } else if (this.isApp) {
        this.socket.hostname = 'app.hirschberg-sauerland.de'
        this.socket.secure = true
      }
    }
  }
})
