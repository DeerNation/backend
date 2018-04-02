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

      'channel-bar-form-items': {
        style: {
          color: 'background-selected',
          backgroundColor: 'dark-form-item-bg',
          width: 2
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

      'activity-bubble-left': {
        style: {
          color: 'lightgrey',
          width: 1,
          backgroundColor: 'bg-message',
          radius: 10,
          shadowBlurRadius: 4,
          shadowVerticalLength: 2,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          bubble: ['left', 20, 20],
          bubbleShape: 'second-missing'
        }
      },

      'activity-bubble-right': {
        include: 'activity-bubble-left',

        style: {
          backgroundColor: 'bg-own-message',
          bubble: ['right', 20, 20]
        }
      }
    }
  })
