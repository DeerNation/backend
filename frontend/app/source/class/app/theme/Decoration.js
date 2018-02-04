/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.theme.Decoration',
  {
    extend: qx.theme.indigo.Decoration,

    decorations:
    {
      'activity-group': {
        style:
        {
          width: [2, 0, 0, 0],
          color: 'activity-group-line'
        }
      },
      'rounded': {
        style: {
          radius: 2
        }
      },

      'channel-bar-form-items': {
        style: {
          color: 'background-selected',
          backgroundColor: 'dark-form-item-bg',
          width: 2
        }
      }
    }
  })
