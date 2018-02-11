/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.mobile.theme.Decoration', {
  extend: app.theme.Decoration,

  decorations: {
    'button': {
      style: {
        width: [0, 1, 0, 1],
        color: [null, 'button-left-border', null, 'button-right-border']
      }
    }
  }
})
