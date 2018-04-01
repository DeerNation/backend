/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.mobile.theme.Appearance', {
  extend: app.theme.Appearance,

  appearances: {
    'main/menu': {
      style: function () {
        return {
          backgroundColor: 'menu-background',
          textColor: 'menu-text',
          padding: [10, 18]
        }
      }
    },

    'channel-listitem': {
      include: 'listitem',
      alias: 'listitem',

      style: function () {
        return {
          padding: [0, 18, 0, 18],
          height: 50,
          font: 'channel',
          textColor: 'inherit'
        }
      }
    },

    'channel-listitem/icon': {
      include: 'main/menu/actor-icon',
      alias: 'main/menu/actor-icon',

      style: function () {
        return {
          font: 'channel',
          width: 40,
          height: 40,
          maxWidth: 40,
          maxHeight: 40,
          marginRight: 8,
          show: 'label',
          decorator: 'rounded',
          textColor: 'white',
          center: true
        }
      }
    },

    'channel-listitem/type': {
      style: function () {
        return {
          width: 20,
          height: 20,
          scale: true,
          margin: [0, 4, 0, 8]
        }
      }
    },

    'activity-listitem': {
      include: 'listitem',
      alias: 'listitem',
      style: function (states) {
        return {
          padding: 0,
          textColor: undefined,
          backgroundColor: states.marked ? 'background-selected' : null
        }
      }
    },

    'activity-listitem/container': {
      style: function (states) {
        return {
          padding: 10,
          margin: states.own ? [10, 20, 10, 10] : [10, 10, 10, 20],
          decorator: 'activity-bubble-' + (states.own ? 'right' : 'left')
        }
      }
    }

    // 'splitpane/menu/favorite-button': {
    //   include: 'button',
    //   alias: 'button',
    //
    //   style: function () {
    //     return {
    //       show: 'both',
    //       iconPosition: 'top',
    //       font: 'small',
    //       decorator: 'button'
    //     }
    //   }
    // },
    //
    // 'splitpane/menu/public-button': 'splitpane/menu/favorite-button',
    // 'splitpane/menu/private-button': 'splitpane/menu/favorite-button'
  }
})
