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

      'actor-icon': {
        style: {
          radius: 50
        }
      },

      'date-sheet': {
        style: {
          radius: 6,
          width: [0, 1, 0, 1],
          innerWidth: [5, 0],
          innerColor: 'event-default-bg',
          color: 'menu-background',
          style: 'solid',
          shadowBlurRadius: 4,
          shadowVerticalLength: 2,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          inset: false
        }
      },

      'channel-bar-form-items': {
        style: {
          color: 'background-selected',
          backgroundColor: 'dark-form-item-bg',
          width: 2
        }
      },

      'form-field': {
        style: {
          color: 'menu-text',
          width: 1
        }
      },

      'category': {
        style: {
          radius: 10,
          color: 'info-font',
          width: 1,
          backgroundColor: 'category-bg',
          shadowBlurRadius: 3
        }
      },

      'flat-button-h': {
        style: {
          width: [0, 1, 0, 1],
          color: 'button-border'
        }
      },
      'flat-button-h-first': {
        style: {
          width: [0, 1, 0, 0],
          color: 'button-border'
        }
      },
      'flat-button-h-last': {
        style: {
          width: [0, 0, 0, 1],
          color: 'button-border'
        }
      },

      'activity-bubble': {
        style: {
          color: 'lightgrey',
          width: 1,
          backgroundColor: 'white',
          radius: 10,
          shadowBlurRadius: 4,
          shadowVerticalLength: 2,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          bubble: ['left', 30, 20]
        }
      }
    }
  })
