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
          backgroundColor: '#EEEEEE',
          marginBottom: 8
        }
      }
    },

    'main/channel/header/title': {
      style: function () {
        return {
          margin: 0,
          allowGrowY: false,
          gap: 4,
          center: true
        }
      }
    },
    'main/channel/header/description': {
      style: function () {
        return {
          textColor: 'lightgrey',
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
          textColor: 'lightgrey',
          backgroundColor: states.pressed ? 'lightgrey' : 'transparent',
          decorator: dec,
          height: 50,
          width: 50,
          center: true
        }
      }
    },

    'main/channel/header/more-button': 'main/channel/header/back-button',
    'main/channel/header/favorite': {
      include: 'main/channel/header/back-button',
      alias: 'main/channel/header/back-button',

      style: function (states) {
        return {
          textColor: states.enabled ? 'favorite' : 'lightgrey'
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
