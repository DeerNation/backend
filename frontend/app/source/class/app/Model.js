/**
 * Central Model that holds all the relevant data for the current user
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.Model', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.__subscribedChannels = {}
    this.setChannels(new qx.data.Array())
    this.setSubscriptions(new qx.data.Array())
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    lookup: function (type, id) {
      return app.Model.getInstance().lookup(type, id)
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {

    /**
     * DO NOT REPLACE THIS ARRAY!!! Only modify its content
     */
    channels: {
      check: 'qx.data.Array',
      init: null
    },

    /**
     * DO NOT REPLACE THIS ARRAY!!! Only modify its content
     */
    subscriptions: {
      check: 'qx.data.Array',
      init: null
    },

    selectedSubscription: {
      check: 'app.model.Subscription',
      nullable: true,
      event: 'changedSelectedSubscription'
    },

    actor: {
      check: 'app.model.Actor',
      init: null
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __subscribedChannels: null,

    init: function () {
      const socket = app.io.Socket.getInstance()

      app.io.Rpc.getProxy().getChannels().then(channels => {
        this.getChannels().append(app.model.Factory.createAll(channels, app.model.Channel))

        socket.subscribe('crud>publicChannels():Channel').then(channel => {
          this.__subscribedChannels[channel.name] = channel
          channel.watch(this._onUpdate.bind(this, 'channel'))
        })

        return app.io.Rpc.getProxy().getSubscriptions()
      }).then(subs => {
        this.getSubscriptions().append(app.model.Factory.createAll(subs, app.model.Subscription))

        // now subscribe to changes

        socket.subscribe('crud>mySubscriptions(' + qx.lang.Json.stringify({actorId: socket.getAuthToken().user}) + '):Subscription').then(channel => {
          this.__subscribedChannels[channel.name] = channel
          channel.watch(this._onUpdate.bind(this, 'subscription'))
        })
      })
    },

    /**
     * Handles incoming updates on the subscription channel
     *
     * @param type {String} type of the updated data model
     * @param data {Object} changed data
     * @protected
     */
    _onUpdate: function (type, data) {
      console.log(type, data)
    },

    /**
     * Search an object by type and ID
     *
     * @param type {String} type of the object (e.g. channel, subscription)
     * @param id {String} ID of the object
     */
    lookup: function (type, id) {
      let found = null
      const propertyName = type.endsWith('s') ? type : type + 's'
      if (qx.Class.hasProperty(this.constructor, propertyName)) {
        this['get' + qx.lang.String.firstUp(propertyName)]().some(entry => {
          if (entry.getId() === id) {
            found = entry
            return true
          }
        })
      }
      return found
    }
  },

  /*
 ******************************************************
   DESTRUCTOR
 ******************************************************
 */
  destruct: function () {
    if (this.__subscribedChannels) {
      // unsubscribe from all channels
      Object.values(this.__subscribedChannels).forEach(channel => {
        channel.unwatch()
        channel.unsubscribe()
      })
      this.__subscribedChannels = null
    }
  }
})
