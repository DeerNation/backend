/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

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
      },

      'add-button': {
        style: {
          radius: 60,
          backgroundColor: 'menu-background'
        }
      },

      /*
      ---------------------------------------------------------------------------
        FORM ELEMENTS
      ---------------------------------------------------------------------------
       */
      'textfield': {
        style: {
          color: 'lightgrey',
          backgroundColor: 'white',
          width: 2
        }
      }
    }
  })
