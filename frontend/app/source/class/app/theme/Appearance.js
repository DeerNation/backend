/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.theme.Appearance',
  {
    extend: qx.theme.indigo.Appearance,

    appearances:
    {
      'activity-group-item':
      {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            padding: 4,
            textAlign: 'center',
            font: 'activity-group',
            decorator: 'activity-group'
          }
        }
      },

      'channel-group-item': {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            padding: [18, 8, 4, 8],
            font: 'channel-group'
          }
        }
      },

      'channel-listitem': {
        include: 'listitem',
        alias: 'listitem',

        style: function () {
          return {
            padding: [0, 8, 0, 8],
            font: 'channel',
            textColor: 'inherit'
          }
        }
      },

      'splitpane/menu': {
        style: function () {
          return {
            backgroundColor: 'menu-background',
            width: 280,
            minWidth: 280,
            maxWidth: 280,
            padding: 8,
            textColor: 'menu-text'
          }
        }
      },
      'splitpane/menu/list': {
        include: 'list',
        alias: 'list',

        style: function () {
          return {
            backgroundColor: 'transparent',
            textColor: 'inherit',
            decorator: null
          }
        }
      }
    }
  })
