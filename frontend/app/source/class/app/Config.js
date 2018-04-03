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
      back: '@Material/chevron_left',
      location: '@Material/location_on',
      organizer: '@Material/recent_actors',
      time: '@Material/access_time',
      refresh: '@Material/refresh'
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
