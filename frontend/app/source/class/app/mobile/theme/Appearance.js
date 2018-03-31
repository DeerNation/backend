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
    'main/calendar/calendar-container': {
      style: function () {
        return {
          margin: [8, 0, 0, 0]
        }
      }
    },

    'main/channel/header': {
      style: function () {
        return {
          height: 50,
          padding: 0,
          backgroundColor: 'menu-background',
          marginBottom: 8,
          textColor: 'menu-text'
        }
      }
    },

    'main/channel/header/title': {
      style: function () {
        return {
          margin: 0,
          padding: [4, 10, 0, 10],
          allowGrowY: false,
          gap: 4,
          center: true
        }
      }
    },
    'main/channel/header/title/label': {
      style: function () {
        return {
          font: 'channel'
        }
      }
    },
    'main/channel/header/description': {
      style: function () {
        return {
          margin: 0
        }
      }
    },

    'main/channel/header/back-button': {
      style: function (states) {
        let dec = 'flat-button-h'
        if (states.first) {
          dec += '-first'
        } else if (states.last) {
          dec += '-last'
        }
        return {
          backgroundColor: states.pressed ? 'lightgrey' : 'transparent',
          decorator: dec,
          height: 50,
          width: 50,
          center: true
        }
      }
    },

    'main/channel/back-button': 'main/channel/header/back-button',
    'main/channel/delete-button': 'main/channel/header/back-button',
    'main/channel/share-button': 'main/channel/header/back-button',

    'main/channel/header/more-button': 'main/channel/header/back-button',
    'main/channel/header/favorite': {
      include: 'main/channel/header/back-button',
      alias: 'main/channel/header/back-button',

      style: function (states) {
        return {
          textColor: states.enabled ? 'favorite' : 'lightgrey'
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
