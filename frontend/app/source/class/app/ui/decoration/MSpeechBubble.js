// noinspection JSUnusedGlobalSymbols
/**
 * Create speech bubble markers via CSS
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
      check: 'String',
      init: '50%',
      transform: '__transformDimension'
    },

    /**
     * Bubble shape (examples for top positioned bubble)
     * equal-sided:   /\
     *
     * first-missing: |\
     *
     *  second-missing: /|
     */
    bubbleShape: {
      check: ['equal-sided', 'first-missing', 'second-missing'],
      init: 'equal-sided'
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
    __transformDimension: function (value) {
      return qx.lang.Type.isNumber(value) ? value + 'px' : value
    },

    __getShapeStyle: function (position) {
      switch (this.getBubbleShape()) {
        case 'equal-sided':
          switch (position) {
            case 'top':
              return {'border-top': 0}
            case 'right':
              return {'border-right': 0}
            case 'left':
              return {'border-left': 0}
            case 'bottom':
              return {'border-bottom': 0}
          }
          break

        case 'first-missing':
          switch (position) {
            case 'top':
              return {'border-top': 0, 'border-left': 0}
            case 'right':
              return {'border-right': 0, 'border-bottom': 0}
            case 'left':
              return {'border-left': 0, 'border-bottom': 0}
            case 'bottom':
              return {'border-bottom': 0, 'border-left': 0}
          }
          break

        case 'second-missing':
          switch (position) {
            case 'top':
              return {'border-top': 0, 'border-right': 0}
            case 'right':
              return {'border-right': 0, 'border-top': 0}
            case 'left':
              return {'border-left': 0, 'border-top': 0}
            case 'bottom':
              return {'border-bottom': 0, 'border-right': 0}
          }
          break
      }
    },

    _styleSpeechBubble: function (styles) {
      if (this.getBubbleSize() > 0) {
        const Color = qx.theme.manager.Color.getInstance()

        const innerStyle = {
          'content': '""',
          'position': 'absolute',
          'width': 0,
          'height': 0,
          'border': this.getBubbleSize() + 'px solid transparent',
          'z-index': 1
        }
        const shapeStyle = this.__getShapeStyle(this.getBubbleEdge())
        Object.assign(innerStyle, shapeStyle)
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
              'left': this.getBubblePosition(),
              'border-bottom-color': backgroundColor,
              'margin-left': this.getBubbleSize() * -0.5 + 'px',
              'margin-top': this.getBubbleSize() * -1 + 'px'
            })
            if (this.getWidthTop() > 0) {
              Object.assign(outerStyle, {
                'border': this.getBubbleSize() + this.getWidthTop() * 2 + 'px solid transparent',
                'top': 0,
                'left': this.getBubblePosition(),
                'border-bottom-color': Color.resolve(this.getColorTop()),
                'margin-left': Math.round((this.getBubbleSize() * -0.5 - this.getWidthTop())) + 'px',
                'margin-top': (this.getBubbleSize() * -1 - this.getWidthLeft() * 2) + 'px'
              })
              hasBorder = true
            }
            break

          case 'bottom':
            Object.assign(innerStyle, {
              'bottom': 0,
              'left': this.getBubblePosition(),
              'border-top-color': backgroundColor,
              'margin-left': this.getBubbleSize() * -0.5 + 'px',
              'margin-bottom': this.getBubbleSize() * -1 + 'px'
            })
            break

          case 'left':
            Object.assign(innerStyle, {
              'left': 0,
              'top': this.getBubblePosition(),
              'border-right-color': backgroundColor,
              'margin-top': this.getBubbleSize() * -0.5 + 'px',
              'margin-left': this.getBubbleSize() * -1 + 'px'
            })
            if (this.getWidthLeft() > 0) {
              Object.assign(outerStyle, {
                'border': this.getBubbleSize() + this.getWidthLeft() * 2 + 'px solid transparent',
                'left': 0,
                'top': this.getBubblePosition(),
                'border-right-color': Color.resolve(this.getColorLeft()),
                'margin-top': Math.round((this.getBubbleSize() * -0.5 - this.getWidthLeft())) + 'px',
                'margin-left': (this.getBubbleSize() * -1 - this.getWidthLeft() * 2) + 'px'
              })
              hasBorder = true
              // styles['margin-left'] = this.getBubbleSize() + this.getWidthLeft() * 2  + 'px'
            } else {
              // styles['margin-left'] = this.getBubbleSize() + 'px'
            }
            break

          case 'right':
            Object.assign(innerStyle, {
              'right': 0,
              'top': this.getBubblePosition(),
              'border-left-color': backgroundColor,
              'margin-top': this.getBubbleSize() * -0.5 + 'px',
              'margin-right': this.getBubbleSize() * -1 + 'px'
            })
            if (this.getWidthRight() > 0) {
              Object.assign(outerStyle, {
                'border': this.getBubbleSize() + this.getWidthRight() * 2 + 'px solid transparent',
                'right': 0,
                'top': this.getBubblePosition(),
                'border-left-color': Color.resolve(this.getColorLeft()),
                'margin-top': Math.round((this.getBubbleSize() * -0.5 - this.getWidthRight())) + 'px',
                'margin-right': (this.getBubbleSize() * -1 - this.getWidthRight() * 2) + 'px'
              })
              hasBorder = true
              // styles['margin-right'] = this.getBubbleSize() + this.getWidthRight() * 2 + 'px'
            } else {
              // styles['margin-right'] = this.getBubbleSize() + 'px'
            }
            break
        }
        Object.assign(outerStyle, shapeStyle)
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
