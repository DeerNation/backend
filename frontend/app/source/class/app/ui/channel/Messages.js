/**
 * The main menu on the left side, showing the current Actor, his subscribed channels and more.
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.channel.Messages', {
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
      this.base(arguments, subscription, oldSubscription)
      this.debug('subscription applied')
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
        this.getChildControl('editor-container').setSelection([this.getChildControl('message-field')])
      } else {
        this.getChildControl('editor-container').resetSelection()
      }
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
          control.getSelection().addListener('change', this._onSelection, this)
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

        case 'message-field':
          control = new (app.model.activity.Registry.getFormClass('message'))()
          if (this.getSubscription()) {
            control.setModel(this.getSubscription().getChannel())
          }
          this.getChildControl('editor-container').add(control)
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
      }
      return control || this.base(arguments, id, hash)
    },

    /**
     * Handle activity selections
     * @protected
     */
    _onSelection: function () {
      const selection = this.getChildControl('list').getSelection()
      // TODO handle other Activity types
      if (selection.getLength() === 1) {
        const activity = selection.getItem(0)
        const actor = app.Model.getInstance().getActor()
        if (actor && (actor.isAdmin() ||
            activity.getActorId() === actor.getId() ||
            this.getSubscription().getChannel().getOwnerId() === actor.getId()
        )) {
          switch (activity.getType()) {
            case 'Message':
              this.getChildControl('message-field').setActivity(activity)
              break

            case 'Event':
              this.error('Not implemented')
              break
          }
        }
      } else {
        this.getChildControl('message-field').resetActivity()
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
        }.bind(this),

        bindItem: function (controller, item, index) {
          controller.bindProperty('', 'model', null, item, index)
          controller.bindProperty('published', 'published', null, item, index)
          controller.bindProperty('actor', 'author', null, item, index)
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
  }
})
