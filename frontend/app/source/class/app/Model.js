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
    this.setChannels(new app.api.Array())
    this.setSubscriptions(new app.api.Array())
    this.setActors(new app.api.Array())

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
      check: 'app.api.Array',
      init: null
    },

    /**
     * DO NOT REPLACE THIS ARRAY!!! Only modify its content
     */
    subscriptions: {
      check: 'app.api.Array',
      init: null
    },

    selectedSubscription: {
      check: function (value) {
        return (value instanceof proto.dn.model.Subscription) || (value instanceof proto.dn.model.Channel)
      },
      nullable: true,
      event: 'changedSelectedSubscription'
    },

    /**
     * The current user
     */
    actor: {
      check: 'proto.dn.model.Actor',
      nullable: true,
      event: 'changedActor',
      apply: '_applyActor'
    },

    actors: {
      check: 'app.api.Array',
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
    __modelStream: null,

    _applyActor: function (value) {
      if (value) {
        value.setOnline(true)
      }
    },

    init: async function () {
      const service = app.api.Service.getInstance()
      const modelStream = this.__modelStream = await service.getModel(new proto.dn.Empty())
      modelStream.addListener('message', this._onModelUpdate, this)
      modelStream.addListener('error', (err) => {
        this.error(err)
      }, this)
    },

    /**
     * Handle message on the getModel streaming channel
     * @param ev {Event}
     * @private
     */
    _onModelUpdate: function (ev) {
      const update = ev.getData()

      const socket = app.io.Socket.getInstance()
      const currentUserId = socket.getAuthToken() && socket.getAuthToken().user

      const objectChange = update.getObject()
      if (objectChange) {
        console.log('ObjectChange:', objectChange)
        // change for a single object send to bus where the objects listen to
        qx.event.message.Bus.dispatchByName('proto.dn.model.' + objectChange.getContent().getUid(), objectChange)
        if (objectChange.getType() === proto.dn.ChangeType.ADD) {
          if (objectChange.getContent() instanceof proto.dn.model.Subscription &&
            objectChange.getContent().getActor().getUid() === this.getActor().getUid()
          ) {
            // new subscriptions
            this.getSubscriptions().push(objectChange.getContent())
          }
        }
      }

      switch (update.getType()) {
        case proto.dn.ChangeType.REPLACE:
          this.getChannels().removeAll()
          this.getSubscriptions().removeAll()
          this.getActors().replace(update.getActors())
          this.getChannels().replace(update.getPublicChannels())
          if (currentUserId) {
            this.setActor(update.getMe())
            this.getSubscriptions().replace(update.getSubscriptions())

            this.__subscribeAndWatchChannel('$INT.users', this._onIntUsersUpdate.bind(this))
            // as we can only get here when the user is online, tell the others
            socket.emit('$INT.users', {id: this.getActor().getUid(), online: true})

            socket.addListener('changeAuthenticated', ev => {
              let payload = null
              if (ev.getData() === true) {
                payload = {id: this.getActor().getUid(), online: true}
              } else if (ev.getOldData() === true) {
                // we have been authenticated but not any more, tell the world
                payload = {id: this.getActor().getUid(), online: false}
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
          break

        case proto.dn.ChangeType.UPDATE:
          ['subscriptions', 'actors', 'publicChannels'].forEach(type => {
            const content = update.get(type)
            if (content) {
              const localType = type === 'publicChannels' ? 'channels' : type
              content.forEach(entry => {
                const existing = this.lookup(localType, entry.getUid())
                if (existing) {
                  const changes = qx.util.Serializer.toNativeObject(entry, app.api.Utils.serialize)
                  if (Object.keys(changes).length > 0) {
                    // apply changes
                    this.debug(`applying changes to ${type} ${entry.getUid()}: ${qx.lang.Json.stringify(changes, null, 2)}`)
                    existing.set(changes)
                  }
                }
              })
            }
          })
          break

        case proto.dn.ChangeType.DELETE:
          ['subscriptions', 'actors', 'publicChannels'].forEach(type => {
            const content = update.get(type)
            if (content) {
              const localType = type === 'publicChannels' ? 'channels' : type
              content.forEach(entry => {
                const existing = this.lookup(localType, entry.getUid())
                if (existing) {
                  this.get(localType).remove(existing).dispose()
                }
              })
            }
          })
          break

        case proto.dn.ChangeType.ADD:
          ['subscriptions', 'actors', 'publicChannels'].forEach(type => {
            const content = update.get(type)
            if (content) {
              const localType = type === 'publicChannels' ? 'channels' : type
              content.forEach(entry => {
                const existing = this.lookup(localType, entry.getUid())
                if (!existing) {
                  this.get(localType).push(entry)
                }
              })
            }
          })
          break

        default:
          this.warn('unhandled update type ' + update.getType())
          break
      }
    },

    /**
     * Returns the relation (owner, member, none) the current user has to this channel.
     * This is relevant for checking the acls.
     * @param channel {proto.dn.model.Channel}
     */
    getChannelRelation: function (channel) {
      const actor = this.getActor()
      const actorId = actor ? actor.getUid() : null
      let channelRelation = null
      if (actorId && channel.getOwner().getUid() === actorId) {
        channelRelation = 'owner'
      } else {
        this.getSubscriptions().some(sub => {
          if (sub.getChannel.getUid() === channel.getUid()) {
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
     * @param type {String?} type of the object (e.g. channel, subscription)
     * @param id {String} ID of the object
     */
    lookup: function (type, id) {
      let found = null
      // search everywhere
      if (!type) {
        ['subscriptions', 'actors', 'channels'].some(name => {
          found = this.lookup(name, id)
          if (found) {
            return true
          }
        })
        return found
      }
      const propertyName = type.endsWith('s') ? type : type + 's'
      const target = this['get' + qx.lang.String.firstUp(type) + 's']()

      if (this.__lookupCache[propertyName] && this.__lookupCache[propertyName][id]) {
        return this.__lookupCache[propertyName][id]
      }
      if (qx.Class.hasProperty(this.constructor, propertyName)) {
        target.some(entry => {
          if (entry.getUid() === id) {
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

        const res = await app.api.Service.getInstance().getObject(new proto.dn.Uid({uid: id}))
        found = this.__lookupCache[propertyName][id] = res
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
    this._disposeObjects('__modelStream')
  }
})
