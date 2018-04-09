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
 * Shows all activities in a channel.
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.channel.View', {
  extend: app.ui.channel.AbstractChannel,
  include: qx.ui.core.MBlocker,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())

    this.__dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat('long'))

    const list = this.getChildControl('list')
    this._createChildControl('status-bar')
    this._createChildControl('add-button')

    list.getChildControl('throbber').show()

    this._debouncedUnblock = qx.util.Function.debounce(() => {
      list.getChildControl('throbber').exclude()
    }, 250)

    const selectUp = new qx.ui.command.Command('Up')
    const selectDown = new qx.ui.command.Command('Down')
    const deselect = new qx.ui.command.Command('Esc')
    selectUp.addListener('execute', this._onSelectUp, this)
    selectDown.addListener('execute', this._onSelectDown, this)
    deselect.addListener('execute', this._onDeselection, this)

    this.__writingUsers = new qx.data.Array()
    this.__writingUserTimers = {}
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'channel-view'
    },

    addButtonSize: {
      check: 'Number',
      init: 60,
      themeable: true,
      apply: '_applyButtonSize'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __dateFormat: null,
    __writingUsers: null,
    __writingUserTimers: null,
    _prefetcher: null,

    // property apply
    _applySubscription: function (subscription, oldSubscription) {
      this.addListenerOnce('subscriptionApplied', () => {
        this.debug('subscription applied')
        // check user permission to publish messages in this channel
        if (this.isAllowed('p')) {
          this.getChildControl('add-button').show()
        } else {
          this.getChildControl('add-button').exclude()
        }
      })
      this.base(arguments, subscription, oldSubscription)
    },

    // property apply
    _applyActivities: function (value) {
      this.debug('activities applied')
      if (this.hasChildControl('list')) {
        this.getChildControl('list').setModel(value)
        this.getChildControl('list').addListener('changeBottomReached', (ev) => {
          if (ev.getData()) {
            this._debouncedUnblock()
          }
        })
      }
    },

    // property apply
    _applyButtonSize: function () {
      if (this.getBounds()) {
        this._onResize()
      }
    },

    /**
     * Select the next editable activity above the current selection (or the last one when no one is selected)
     * @protected
     */
    _onSelectUp: function () {
      const selection = this.getChildControl('list').getSelection().getItem(0)
      const activities = this.getActivities()
      let index = selection ? activities.indexOf(selection) : activities.getLength() - 1
      if (index > 0) {
        index--
      }
      this.getChildControl('list').getSelection().replace([activities.getItem(index)])
    },

    /**
     * Select the next editable activity below the current selection (stops at the end of the list)
     * @protected
     */
    _onSelectDown: function () {
      const selection = this.getChildControl('list').getSelection().getItem(0)
      const activities = this.getActivities()
      let index = selection ? activities.indexOf(selection) : activities.getLength() - 1
      if (index + 1 < activities.getLength()) {
        index++
      }
      this.getChildControl('list').getSelection().replace([activities.getItem(index)])
    },

    /**
     * Reset list selection
     * @protected
     */
    _onDeselection: function () {
      this.getChildControl('list').getSelection().removeAll()
    },

    /**
     * Deselect the currently selected item if it has been clicked
     * @param ev {Event}
     * @protected
     */
    _toggleSelection: function (ev) {
      const activity = ev.getCurrentTarget().getModel()
      const selection = this.getChildControl('list').getSelection().getLength() > 0
        ? this.getChildControl('list').getSelection().getItem(0)
        : null
      if (selection === activity) {
        this._onDeselection()
      }
    },

    // overridden
    _handleSubscribed: function (isSubscribed) {
      if (isSubscribed) {
        // show default
        // if (this.isReady()) {
        //   this._initForm()
        // } else {
        //   this.addListenerOnce('changeReady', this._initForm, this)
        // }
      } else {
        this.getChildControl('editor-container').resetSelection()
      }
    },

    _initForm: function () {
      const form = app.model.activity.Registry.getForm(app.model.activity.Registry.DEFAULT_TYPE)
      if (!this.getChildControl('editor-container').getChildren().includes(form)) {
        this.getChildControl('editor-container').add(form)
        this.bind('subscription.channel', form, 'channel')
      }
      this.getChildControl('editor-container').setSelection([form])
    },

    // overridden
    _handleSubscriptionAcl: function (allowed) {
      if (allowed) {
        // users can enter this channel -> show login/register hint
        this.getChildControl('editor-container').setSelection([this.getChildControl('login-hint')])
      } else {
        this.getChildControl('editor-container').exclude()
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'list':
          control = new app.ui.list.ChatList()
          control.setVariableItemHeight(true)
          this.__applyListDelegate(control)
          this._addAt(control, 1, {flex: 1})

          // start prefetcher
          this._prefetcher = new qx.ui.virtual.behavior.Prefetch(control, {
            minLeft: 0,
            maxLeft: 0,
            minRight: 0,
            maxRight: 0,
            minAbove: 500,
            maxAbove: 2000,
            minBelow: 0,
            maxBelow: 500
          })
          break

        case 'editor-container':
          control = new qx.ui.container.Stack()
          this._addAt(control, 3)
          break

        case 'login-hint':
          control = new qx.ui.basic.Label(this.tr('To enter this channel you need a user account. Please login or register yourself.'))
          control.set({
            rich: true,
            wrap: true
          })
          control.addListener('tap', () => {
            app.io.Socket.getInstance().login().then(loggedIn => {
              if (loggedIn) {
                // TODO re-evaluate acls and if the currently shown channel is already subscribed by the current user

              }
            })
          })
          this.getChildControl('editor-container').add(control)
          break

        case 'add-button':
          control = new qx.ui.form.Button('', app.Config.icons.plus + '/30')
          if (this.getBounds()) {
            this._onResize()
          } else {
            control.setUserBounds(0, 0, 0, 0)
            this.addListenerOnce('appear', this._onResize, this)
          }
          this._add(control)
          control.addListener('execute', this._onAddActivity, this)
          this.addListener('resize', this._onResize, this)
          break
      }
      return control || this.base(arguments, id, hash)
    },

    /**
     * Open the activity type selector
     * @private
     */
    _onAddActivity: function () {

    },

    _onResize: function () {
      const bounds = this.getBounds()
      const size = this.getAddButtonSize()
      this.getChildControl('add-button').setUserBounds(bounds.width - size - 10, bounds.height - size - 10, size, size)
    },

    // property apply, overridden
    _applyInSelectionMode: function (value, old) {
      this.base(arguments, value, old)
      if (value) {
        this.getChildControl('add-button').exclude()
      } else {
        this.getChildControl('add-button').show()
      }
    },

    __applyListDelegate: function (list) {
      const dateFormat = this.__dateFormat

      list.setDelegate({
        createItem: function () {
          return new app.ui.form.ActivityItem()
        },

        configureItem: function (item) {
          item.addListener('tap', this._toggleSelection, this)
          item.addListener('activityAction', this._onActivityAction, this)
          item.addListener('longtap', this._onActivityContext, this)
        }.bind(this),

        bindItem: function (controller, item, index) {
          controller.bindProperty('', 'model', null, item, index)
          controller.bindProperty('published', 'published', null, item, index)
          controller.bindProperty('actor', 'author', null, item, index)
          controller.bindProperty('marked', 'marked', null, item, index)
        },

        group: function (model) {
          const date = model.getPublished() || model.getCreated()
          return date ? dateFormat.format(date) : null
        },

        // createGroupItem: function () {
        //   return new app.ui.form.ActivityActor()
        // },
        //
        configureGroupItem: function (item) {
          item.setAppearance('activity-group-item')
        },
        //
        // bindGroupItem: function (controller, item, index) {
        //
        // },

        sorter: function (a, b) {
          const adate = a.getPublished() || a.getCreated()
          const bdate = b.getPublished() || b.getCreated()
          return adate.getTime() - bdate.getTime()
        }
      })
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    this._disposeMap('__writingUserTimers')
    this._disposeObjects('_prefetcher')
    this._prefetcher = null
  },

  defer: function (statics) {
    app.plugins.Registry.registerView('channel', statics)
  }
})
