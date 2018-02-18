/**
 * PushPlugin class is a wrapper for the phonegap-plugin-push plugin
 * to make it behave similar to {@link app.io.Firebase}
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.io.PushPlugin', {
  extend: app.io.AbstractNotification,
  type: 'singleton',

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __push: null,

    init: function () {
      this.__push = PushNotification.init({
        android: {
          icon: 'deer',
          iconColor: '#426d2b'
        },
        browser: {
          pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        },
        ios: {
          alert: 'true',
          badge: 'true',
          sound: 'true'
        },
        windows: {}
      })

      // add listeners
      this.__push.on('registration', (data) => {
        this.setToken(data.registrationId)
      })

      this.__push.on('notification', (data) => {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
        console.log(data)
        if (data.additionalData.hasOwnProperty('channelId')) {
          // open the channel
          this.debug('Opening channel ', data.additionalData.channelId)
          app.Model.getInstance().selectChannel(data.additionalData.channelId)
        }
      })

      this.__push.on('error', (e) => {
        this.error(e)
      })
    }
  }

})
