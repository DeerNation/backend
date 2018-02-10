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

      'date-sheet': {
        style: {
          radius: 6,
          width: 1,
          color: 'menu-background',
          style: 'solid',
          shadowBlurRadius: 4,
          shadowVerticalLength: 2,
          shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
          inset: [true, false]
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
