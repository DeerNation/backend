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
