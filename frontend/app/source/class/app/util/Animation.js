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

/**
 * Animation
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.util.Animation', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    /* Target slides in from right. */
    SLIDE_LEFT_IN: {
      duration: 200,
      timing: 'ease-in-out',
      origin: 'bottom center',
      keep: 100,
      keyFrames: {
        0: {
          translate: ['100%']
        },
        100: {
          translate: ['0%']
        }
      }
    },

    /* Target slides out from right */
    SLIDE_LEFT_OUT: {
      duration: 200,
      timing: 'ease-in-out',
      origin: 'bottom center',
      keep: 100,
      keyFrames: {
        0: {
          translate: ['0px']
        },
        100: {
          translate: ['-100%']
        }
      }
    },

    /* Target slides in from left. */
    SLIDE_RIGHT_IN: {
      duration: 200,
      timing: 'ease-in-out',
      origin: 'bottom center',
      keep: 100,
      keyFrames: {
        0: {
          translate: ['-100%']
        },
        100: {
          translate: ['0%']
        }
      }
    },

    /* Target slides out from left. */
    SLIDE_RIGHT_OUT: {
      duration: 200,
      timing: 'ease-in-out',
      keep: 100,
      origin: 'bottom center',
      keyFrames: {
        0: {
          translate: ['0px']
        },
        100: {
          translate: ['100%']
        }
      }
    }
  }
})
