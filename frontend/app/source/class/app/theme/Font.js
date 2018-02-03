/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.theme.Font',
  {
    extend: qx.theme.indigo.Font,

    fonts:
    {
      'activity-group':
      {
        size: 11,
        family: ['Lucida Grande', 'DejaVu Sans', 'Verdana', 'sans-serif'],
        bold: true,
        color: 'rgb(68, 68, 68)',
        lineHeight: 1.8
      },

      'channel-group': {
        size: 12,
        family: ['Lucida Grande', 'DejaVu Sans', 'Verdana', 'sans-serif'],
        bold: true,
        color: 'menu-text',
        lineHeight: 1.9
      },

      'channel': {
        size: 16,
        family: ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        color: 'menu-text',
        lineHeight: 2.0
      }
    }
  })
