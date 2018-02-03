/**
 * The main menu on the left side, showing the current Actor, his subscribed channels and more.
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.Channel', {
  extend: qx.ui.core.Widget,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())
    this.setActivities(new qx.data.Array())
    this.__dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat('long'))

    // bind to global selected subscription
    app.Model.getInstance().bind('selectedSubscription', this, 'subscription')

    this._createChildControl('header')
    this._createChildControl('list')
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    /**
     * The channel subscription currently shown
     */
    subscription: {
      check: 'app.model.Subscription',
      nullable: true,
      event: 'changedSubscription',
      apply: '_applySubscription'
    },

    /**
     * All Activities in this channel
     */
    activities: {
      check: 'qx.data.Array',
      init: null,
      event: 'changeActivities',
      apply: '_applyActivities'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __currentSCChannel: null,
    __dateFormat: null,

    // property apply
    _applySubscription: function (subscription, oldSubscription) {
      const socket = app.io.Socket.getInstance()
      if (oldSubscription) {
        const chan = this.__currentSCChannel ? this.__currentSCChannel : socket.getScChannel(oldSubscription.getChannelId())
        if (chan) {
          chan.unwatch()
          chan.unsubscribe()
        }
      }
      if (subscription) {
        this.__currentSCChannel = socket.getScChannel(subscription.getChannelId())
        // get all messages published on this channel (aka the history)
        let activities = this.getActivities()
        activities.removeAll()
        app.io.Rpc.getProxy().getChannelActivities(subscription.getChannelId(), subscription.getViewedUntil()).then(messages => {
          activities.append(app.model.Factory.createAll(messages, app.model.Activity, {
            converter: function (model) {
              if (!model.published) {
                model.published = model.created
              }
            }
          }))
        })

        this.__currentSCChannel.subscribe()
        this.__currentSCChannel.watch(this._onActivity.bind(this))
      }
    },

    // property apply
    _applyActivities: function (value) {
      if (this.hasChildControl('list')) {
        this.getChildControl('list').setModel(value)
      }
    },

    /**
     * Handler for channel watching
     *
     * @param payload {Object} incoming data
     * @protected
     */
    _onActivity: function (payload) {
      if (!qx.lang.Type.isArray(payload)) {
        payload = [payload]
      }
      // create Activity instances and add them to the model
      this.getActivities().append(app.model.Factory.createAll(payload, app.model.Activity, {
        converter: function (model) {
          if (!model.published) {
            model.published = model.created
          }
        }
      }))
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'header':
          control = new qx.ui.container.Composite(new qx.ui.layout.VBox())
          this._addAt(control, 0)
          break

        case 'list':
          control = new qx.ui.list.List(this.getActivities())
          control.setVariableItemHeight(true)
          const deferredScroll = qx.util.Function.debounce(() => {
            control.scrollToY(1e99)
          }, 100)
          this.getActivities().addListener('changeLength', deferredScroll, this)
          this.__applyListDelegate(control)
          this._addAt(control, 1, {flex: 1})
          break
      }
      return control || this.base(arguments, id, hash)
    },

    __applyListDelegate: function (list) {
      const dateFormat = this.__dateFormat

      list.setDelegate({
        createItem: function () {
          return new app.ui.form.ActivityItem()
        },

        bindItem: function (controller, item, index) {
          controller.bindProperty('', 'model', null, item, index)
          controller.bindProperty('title', 'title', null, item, index)
          controller.bindProperty('content', 'message', null, item, index)
          controller.bindProperty('published', 'published', null, item, index)
          controller.bindProperty('actorId', 'author', {
            converter: function (value, model) {
              return app.Model.lookup('actor', model.getActorId())
            }
          }, item, index)
        },

        group: function (model) {
          const date = model.getPublished() || model.getCreated()
          return date ? dateFormat.format(date) : null
        },

        configureGroupItem: function (item) {
          item.setAppearance('activity-group-item')
        },

        sorter: function (a, b) {
          const adate = a.getPublished() || a.getCreated()
          const bdate = b.getPublished() || b.getCreated()
          return adate.getTime() - bdate.getTime()
        }
      })
    }
  }
})
