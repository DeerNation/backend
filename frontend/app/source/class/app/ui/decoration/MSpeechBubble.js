/**
 * Create speech bubble markers cia CSS
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Mixin.define('app.ui.decoration.MSpeechBubble', {

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    bubbleEdge: {
      check: ['top', 'right', 'bottom', 'left'],
      init: 'left'
    },

    bubbleSize: {
      check: 'Integer',
      init: 0
    },

    /**
     * Bubble position on the edge, defined in percent
     */
    bubblePosition: {
      check: function (value) {
        return !isNaN(value) && value >= 0 && value <= 100
      },
      init: 50
    },

    /** Property group to set the bubble */
    bubble: {
      group: ['bubbleEdge', 'bubblePosition', 'bubbleSize'],
      mode: 'shorthand'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _styleSpeechBubble: function (styles) {
      if (this.getBubbleSize() > 0) {
        const positionUnit = 'px'

        const Color = qx.theme.manager.Color.getInstance()

        const innerStyle = {
          'content': '""',
          'position': 'absolute',
          'width': 0,
          'height': 0,
          'border': this.getBubbleSize() + 'px solid transparent',
          'z-index': 1
        }
        const outerStyle = {
          'content': '""',
          'position': 'absolute',
          'width': 0,
          'height': 0,
          'z-index': 0
        }
        let hasBorder = false
        const backgroundColor = Color.resolve(this.getBackgroundColor())
        switch (this.getBubbleEdge()) {
          case 'top':
            Object.assign(innerStyle, {
              'top': 0,
              'left': this.getBubblePosition() + positionUnit,
              'border-bottom-color': backgroundColor,
              'border-top': 0,
              'border-left': 0,
              'margin-left': this.getBubbleSize() * -0.5 + 'px',
              'margin-top': this.getBubbleSize() * -1 + 'px'
            })
            if (this.getWidthTop() > 0) {
              Object.assign(outerStyle, {
                'border': this.getBubbleSize() + this.getWidthTop() * 2 + 'px solid transparent',
                'top': 0,
                'left': this.getBubblePosition() + positionUnit,
                'border-bottom-color': Color.resolve(this.getColorTop()),
                'border-top': 0,
                'border-left': 0,
                'margin-left': Math.round((this.getBubbleSize() * -0.5 - this.getWidthTop())) + 'px',
                'margin-top': (this.getBubbleSize() * -1 - this.getWidthLeft() * 2) + 'px'
              })
              hasBorder = true
            }
            break

          case 'bottom':
            Object.assign(innerStyle, {
              'bottom': 0,
              'left': this.getBubblePosition() + positionUnit,
              'border-top-color': backgroundColor,
              'border-bottom': 0,
              'border-left': 0,
              'margin-left': this.getBubbleSize() * -0.5 + 'px',
              'margin-bottom': this.getBubbleSize() * -1 + 'px'
            })
            break

          case 'left':
            Object.assign(innerStyle, {
              'left': 0,
              'top': this.getBubblePosition() + positionUnit,
              'border-right-color': backgroundColor,
              'border-bottom': 0,
              'border-left': 0,
              'margin-top': this.getBubbleSize() * -0.5 + 'px',
              'margin-left': this.getBubbleSize() * -1 + 'px'
            })
            if (this.getWidthLeft() > 0) {
              Object.assign(outerStyle, {
                'border': this.getBubbleSize() + this.getWidthLeft() * 2 + 'px solid transparent',
                'left': 0,
                'top': this.getBubblePosition() + positionUnit,
                'border-right-color': Color.resolve(this.getColorLeft()),
                'border-bottom': 0,
                'border-left': 0,
                'margin-top': Math.round((this.getBubbleSize() * -0.5 - this.getWidthLeft())) + 'px',
                'margin-left': (this.getBubbleSize() * -1 - this.getWidthLeft() * 2) + 'px'
              })
              hasBorder = true
            }
            break

          case 'right':
            Object.assign(innerStyle, {
              'right': 0,
              'top': this.getBubblePosition() + positionUnit,
              'border-left-color': backgroundColor,
              'border-bottom': 0,
              'border-right': 0,
              'margin-top': this.getBubbleSize() * -0.5 + 'px',
              'margin-right': this.getBubbleSize() * -1 + 'px'
            })
            break
        }
        styles[':after'] = innerStyle
        if (hasBorder) {
          // copy shadow settings
          styles[':before'] = outerStyle
        }
        styles.overflow = 'visible !important'
      }
    }
  }
})
