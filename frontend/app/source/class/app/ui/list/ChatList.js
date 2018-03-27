/**
 * ChatList is a virtual list that provided an autoscrolling feature to always show the lasz list item.
 * This behaviour is active when the user scrolls to the bottom of the list (which is done automatically on initial loading)
 * and gets inactive if the user scrolls up.
 *
 * For performance issues this list is build from bottom to top (reverse to the qx.ui.list.List)
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.list.ChatList', {
  extend: qx.ui.list.List,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (model) {
    this.base(arguments, model)
    // this._deferredScroll = qx.util.Function.debounce(() => {
    //   this.getPane().scrollRowIntoView(this.getModel().length - 1)
    // }, 100)
    this.__jobs = {}
    this.__enableScrollWatcher(true)

    this.getPane().addListener('update', () => {
      this.debug('updated pane')
      this._deferredScroll()
    })
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    autoScroll: {
      check: 'Boolean',
      init: true,
      apply: '_applyAutoScroll'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __jobs: null,
    __bottomReached: false,
    _frid: null,

    // property apply
    _applyAutoScroll: function (value) {
      this.debug('autoscroll:', value)
      if (value) {
        this.addListener('changeModelLength', this._deferredScroll, this)
      } else {
        this.removeListener('changeModelLength', this._deferredScroll, this)
      }
    },

    /**
     * listen to scroll events to check if the user scrolled to the end. In that case
     * the autoScroll property is set to true
     * @param value {Boolean}
     * @private
     */
    __enableScrollWatcher: function (value) {
      if (value) {
        this.getChildControl('scrollbar-y').addListener('scroll', this.__onScrollY, this)
      } else {
        this.getChildControl('scrollbar-y').addListener('scroll', this.__onScrollY, this)
      }
    },

    __onScrollY: function (ev) {
      if (this.isAutoScroll()) {
        if (!this.__bottomReached) {
          return
        }
        if (this.getScrollY() < this.getPane().getScrollMaxY()) {
          // check if user scrolled up and at least half of the last row is not visible any more
          const row = this.getModel().length - 1
          const itemTop = this.getPane().getRowConfig().getItemPosition(row)
          const itemBottom = itemTop + this.getPane().getRowConfig().getItemSize(row)
          const scrollTop = this.getPane().getScrollY()
          if (((itemBottom + itemTop) / 2) >= scrollTop) {
            this.setAutoScroll(false)
          }
        }
      } else if (this.getScrollY() >= this.getPane().getScrollMaxY()) {
        // check if user scrolled to the end
        this.setAutoScroll(true)
      }
    },

    _deferredScroll: function () {
      console.log('deferred scroll')
      this.__jobs._deferredScroll = 1
      qx.ui.core.queue.Widget.add(this)
    },

    // apply method, overridden
    _applyModel: function (value, old) {
      this.base(arguments, value, old)
      this._applyAutoScroll(this.isAutoScroll())
    },

    // overridden
    syncWidget: function () {
      if (this.__jobs._deferredScroll) {
        if (this._frid) {
          return
        }
        new qx.util.DeferredCall(() => {
          const scrollMax = this.getPane().getScrollMaxY()
          const oldScrollTop = this.getPane().getScrollY()
          if (this.__bottomReached === null && oldScrollTop === scrollMax) {
            this.__bottomReached = true
          }
          if (!this.isAutoScroll() || oldScrollTop === scrollMax) {
            return
          }
          // console.log('BEFORE: Max:', scrollMax, 'Current:', oldScrollTop)
          this.getPane().setScrollY(scrollMax)
          this._frid = qx.bom.AnimationFrame.request(() => {
            this._frid = null
            const scrollTop = this.getPane().getScrollY()
            // console.log('AFTER: Max:', scrollMax, 'Current:', scrollTop)
            if (this.__bottomReached === null && scrollTop === scrollMax) {
              this.__bottomReached = true
            }

            if (scrollMax > scrollTop) {
              // try again
              // console.log('re-timing')
              qx.event.Timer.once(this._deferredScroll, this, 100)
            }
            this.fireDataEvent('scrollY', scrollTop, oldScrollTop)
          })
        }, this).schedule()
      }
      this.__jobs = {}
    }
  }
})
