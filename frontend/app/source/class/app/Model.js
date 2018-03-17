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
    this.setActors(new qx.data.Array())

    this.__lookupCache = {}

    let timer = null
    qx.event.Registration.addListener(window, 'blur', () => {
      if (!timer) {
        timer = qx.event.Timer.once(() => {
          if (this.getActor() && this.getActor().getStatus() === 'online') {
            this.getActor().setOnline(false)
          }
          timer = null
        }, this, 60000)
      } else {
        timer.restart()
      }
    })
    qx.event.Registration.addListener(window, 'pointerover', () => {
      if (timer) {
        timer.stop()
        timer = null
      }
      if (this.getActor() && this.getActor().getStatus() === 'online') {
        this.getActor().setOnline(true)
      }
    })
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    lookup: function (type, id) {
      return app.Model.getInstance().lookup(type, id)
    },

    asyncLookup: function (type, id) {
      return app.Model.getInstance().asyncLookup(type, id)
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
      check: function (value) {
        return (value instanceof app.model.Subscription) || (value instanceof app.model.Channel)
      },
      nullable: true,
      event: 'changedSelectedSubscription'
    },

    /**
     * The current user
     */
    actor: {
      check: 'app.model.Actor',
      nullable: true,
      event: 'changedActor'
    },

    actors: {
      check: 'qx.data.Array',
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
    __lookupCache: null,

    init: async function () {
      const socket = app.io.Socket.getInstance()
      const currentUserId = socket.getAuthToken() && socket.getAuthToken().user
      this.getChannels().removeAll()
      this.getSubscriptions().removeAll()

      const actors = await app.io.Rpc.getProxy().getActors()
      this.getActors().replace(app.model.Factory.createAll(actors, app.model.Actor, {
        modelConverter: function (model) {
          // look for current user
          if (model.getId() === currentUserId) {
            model.setOnline(true)
            this.setActor(model)
          }
          return model
        }.bind(this)
      }))

      if (currentUserId) {
        this.__subscribeAndWatchChannel('$INT.users', this._onIntUsersUpdate.bind(this))
        // as we can only get here when the user is online, tell the others
        socket.emit('$INT.users', {id: this.getActor().getId(), online: true})

        socket.addListener('changeAuthenticated', ev => {
          let payload = null
          if (ev.getData() === true) {
            payload = {id: this.getActor().getId(), online: true}
          } else if (ev.getOldData() === true) {
            // we have been authenticated but not any more, tell the world
            payload = {id: this.getActor().getId(), online: false}
          }
          if (payload) {
            socket.emit('$INT.users', payload)
            // as we do not receive out own events, call the handler manually
            this._onIntUsersUpdate(payload)
          }
        })
      } else {
        socket.unsubscribe('$INT.users')
      }

      app.io.Rpc.getProxy().getChannels().then(channels => {
        this.getChannels().append(app.model.Factory.createAll(channels, app.model.Channel))

        this.__subscribeAndWatchChannel('crud>publicChannels():Channel', this._onUpdate.bind(this, 'channel'))

        if (currentUserId) {
          return app.io.Rpc.getProxy().getSubscriptions()
        } else {
          return Promise.resolve([])
        }
      }).then(subs => {
        this.getSubscriptions().append(app.model.Factory.createAll(subs, app.model.Subscription))

        if (currentUserId) {
        // now subscribe to changes
          this.__subscribeAndWatchChannel(
            'crud>mySubscriptions(' + qx.lang.Json.stringify({actorId: currentUserId}) + '):Subscription',
            this._onUpdate.bind(this, 'subscription')
          )
        } else if (this.getActor()) {
          socket.unsubscribe('crud>mySubscriptions(' + qx.lang.Json.stringify({actorId: this.getActor().getid()}) + '):Subscription')
          this.resetActor()
        }
      })
    },

    /**
     * Returns the relation (owner, member, none) the current user has to this channel.
     * This is relevant for checking the acls.
     * @param channel {app.model.Channel}
     */
    getChannelRelation: function (channel) {
      const actor = this.getActor()
      const actorId = actor ? actor.getId() : null
      let channelRelation = null
      if (actorId && channel.getOwnerId() === actorId) {
        channelRelation = 'owner'
      } else {
        this.getSubscriptions().some(sub => {
          if (sub.getChannelId() === channel.getId()) {
            channelRelation = 'member'
            return true
          }
        })
      }
      return channelRelation
    },

    __subscribeAndWatchChannel: function (name, callback) {
      const socket = app.io.Socket.getInstance()
      socket.subscribe(name).then(channel => {
        this.__subscribedChannels[channel.name] = channel
        channel.watch(callback)
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
      const Clazz = qx.Class.getByName('app.model.' + qx.lang.String.firstUp(type))
      const target = this['get' + qx.lang.String.firstUp(type) + 's']()

      switch (data.type) {
        case 'create':
          // get object from backend
          // socket.emit('read', {
          //   type: qx.lang.String.firstUp(type),
          //   id: data.id
          // }, (err, response) => {
          //   if (err) {
          //     this.error(err)
          //   } else {
          //     target.append(app.model.Factory.create(response, Clazz))
          //   }
          // })

          app.io.Rpc.getProxy().getObject(qx.lang.String.firstUp(type), data.id).then(response => {
            // first we make sure that the channel is known
            this.asyncLookup('channel', response.channelId).then(() => {
              target.append(app.model.Factory.create(response, Clazz))
            })
          })
          break

        case 'update':
          // request new date from backend
          // socket.emit('read', {
          //   type: qx.lang.String.firstUp(type),
          //   id: data.id
          // }, (err, response) => {
          //   if (err) {
          //     this.error(err)
          //   } else {
          //     target.some((entry) => {
          //       if (entry.getId() === data.id) {
          //         target.set(response)
          //         return true
          //       }
          //     })
          //     target.append(app.model.Factory.create(response, Clazz))
          //   }
          // })
          app.io.Rpc.getProxy().getObject(qx.lang.String.firstUp(type), data.id).then(response => {
            target.some((entry) => {
              if (entry.getId() === data.id) {
                target.set(response)
                return true
              }
            })
          })
          break

        case 'delete':
          target.some((entry) => {
            if (entry.getId() === data.id) {
              this.debug(type + ' was deleted ', entry)
              target.remove(entry)
              return true
            }
          })
          break
      }
    },

    /**
     * Selected the Subscription for this channel
     * @param channelId {String}
     */
    selectChannel: function (channelId) {
      this.getSubscriptions().some(sub => {
        if (sub.getChannelId() === channelId) {
          // this.setSelectedSubscription(sub)
          const main = qx.core.Init.getApplication().getMain()
          main.getChildControl('menu').getChildControl('list').getSelection().replace([sub])
          return true
        }
      })
    },

    _onIntUsersUpdate: function (data) {
      const actor = this.lookup('actor', data.id)
      if (actor) {
        if (data.hasOwnProperty('online')) {
          actor.setOnline(data.online)
          actor.setStatus(data.online ? qx.locale.Manager.tr('Online') : qx.locale.Manager.tr('Offline'))
        }
        if (data.hasOwnProperty('status')) {
          actor.setStatus(data.status)
        }
      } else {
        this.warning('Actor state update for unknown actor received:', data)
      }
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
      const target = this['get' + qx.lang.String.firstUp(type) + 's']()

      if (this.__lookupCache[propertyName] && this.__lookupCache[propertyName][id]) {
        return this.__lookupCache[propertyName][id]
      }
      if (qx.Class.hasProperty(this.constructor, propertyName)) {
        target.some(entry => {
          if (entry.getId() === id) {
            if (!this.__lookupCache[propertyName]) {
              this.__lookupCache[propertyName] = {}
            }
            found = this.__lookupCache[propertyName][id] = entry
            return true
          }
        })
      }
      return found
    },

    /**
     * Search an object by type and ID and request if from the backend of not found locally
     * @param type {String} type of the object (e.g. channel, subscription)
     * @param id {String} ID of the object
     */
    asyncLookup: async function (type, id) {
      let found = this.lookup(type, id)
      if (!found) {
        const propertyName = type.endsWith('s') ? type : type + 's'
        const target = this['get' + qx.lang.String.firstUp(type) + 's']()
        const Clazz = qx.Class.getByName('app.model.' + qx.lang.String.firstUp(type))

        const res = await app.io.Rpc.getProxy().getObject(qx.lang.String.firstUp(type), id)
        found = this.__lookupCache[propertyName][id] = app.model.Factory.create(res, Clazz)
        target.push(found)
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
