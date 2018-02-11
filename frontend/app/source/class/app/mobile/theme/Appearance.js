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
