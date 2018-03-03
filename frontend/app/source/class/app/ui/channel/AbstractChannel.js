/**
 * AbstractChannel
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.channel.AbstractChannel', {
  extend: qx.ui.core.Widget,
  type: 'abstract',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.setActivities(new qx.data.Array())
    this.addListener('swipe', this._onSwipe, this)

    qx.event.message.Bus.subscribe('channel.activities.delete', this._onActivityDelete, this)
  },

  /*
  ******************************************************
    EVENTS
  ******************************************************
  */
  events: {
   'refresh': 'qx.event.type.Event'
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
      check: function (value) {
        return (value instanceof app.model.Subscription) || (value instanceof app.model.Channel)
      },
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

    _onSwipe: function (ev) {
      if (ev.getDirection() === 'right') {
        const main = qx.core.Init.getApplication().getMain()
        main.getChildControl('menu').getChildControl('list').getSelection().removeAll()
      }
    },

    /**
     * Handle bus messages of deleted activities
     * @param ev {Event}
     * @private
     */
    _onActivityDelete: function (ev) {
      const activity = ev.getData()
      if (activity.getChannelId() === this.getSubscription().getChannelId()) {
        this.getActivities().remove(activity)
      }
    },

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
          this.fireEvent('refresh')
        })
      }
    },

    // property apply
    _applyActivities: function (value) {
    }
  }
})
