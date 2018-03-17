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
          minHeight: 50,
          padding: [0, 10, 0, 0],
          backgroundColor: '#EEEEEE'
        }
      }
    },

    'main/channel/header/back-button': {
      style: function (states) {
        return {
          textColor: 'lightgrey',
          backgroundColor: states.pressed ? 'lightgrey' : 'transparent'
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
