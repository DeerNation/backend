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
 * ChatList is a virtual list that provided an autoscrolling feature to always show the lasz list item.
 * This behaviour is active when the user scrolls to the bottom of the list (which is done automatically on initial loading)
 * and gets inactive if the user scrolls up.
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
    },

    bottomReached: {
      check: 'Boolean',
      init: false,
      event: 'changeBottomReached'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __jobs: null,
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
        if (!this.isBottomReached()) {
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
      this.__jobs._deferredScroll = 1
      qx.ui.core.queue.Widget.add(this)
    },

    // apply method, overridden
    _applyModel: function (value, old) {
      this.base(arguments, value, old)
      this._applyAutoScroll(this.isAutoScroll())
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'throbber':
          control = new app.ui.Throbber()
          control.exclude()
          control.addState('blocking')
          control.setZIndex(100000)
          let bounds = this.getBounds()
          if (bounds) {
            control.setUserBounds(0, 0, bounds.width, bounds.height)
          } else {
            control.setUserBounds(0, 0, 0, 0)
          }
          this.addListener('resize', (ev) => {
            const size = ev.getData()
            control.setUserBounds(0, 0, size.width, size.height)
          })
          this._add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    },

    // overridden
    syncWidget: function () {
      if (this.__jobs._deferredScroll) {
        if (this._frid) {
          return
        }
        const scrollMax = this.getPane().getScrollMaxY()
        const oldScrollTop = this.getPane().getScrollY()
        this.setBottomReached(scrollMax > 0 && oldScrollTop === scrollMax)

        // console.log('BEFORE: Max:', scrollMax, 'Current:', oldScrollTop)
        if (!this.isAutoScroll() || this.isBottomReached()) {
          return
        }
        this.getPane().setScrollY(scrollMax)
        this._frid = qx.bom.AnimationFrame.request(() => {
          this._frid = null
          const scrollTop = this.getPane().getScrollY()
          // console.log('AFTER: Max:', scrollMax, 'Current:', scrollTop)
          this.setBottomReached(scrollMax > 0 && scrollTop === scrollMax)

          if (scrollMax > scrollTop) {
            // try again
            // console.log('re-timing')
            qx.event.Timer.once(this._deferredScroll, this, 100)
          }
          this.fireDataEvent('scrollY', scrollTop, oldScrollTop)
        })
      }
      this.__jobs = {}
    }
  }
})
