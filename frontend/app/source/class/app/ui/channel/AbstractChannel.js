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
    'refresh': 'qx.event.type.Event',
    'subscriptionApplied': 'qx.event.type.Event'
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
    },

    /**
     * ACLs for the current channel/user combination
     */
    channelAcls: {
      check: 'Object',
      nullable: true
    },

    /**
     * ACLs for the current channel-activities/user combination
     */
    channelActivitiesAcls: {
      check: 'Object',
      nullable: true
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
        Promise.all([
          app.io.Rpc.getProxy().getAllowedActions(subscription.getChannelId()),
          app.io.Rpc.getProxy().getAllowedActions(subscription.getChannelId() + '.activities')
        ]).then(acls => {
          this.setChannelAcls(acls[0])
          this.setChannelActivitiesAcls(acls[1])
          if (this.getChannelActivitiesAcls().actions.includes('r')) {
            app.io.Rpc.getProxy().getChannelActivities(subscription.getChannelId(), subscription.getViewedUntil()).then(messages => {
              const newActivities = app.model.Factory.createAll(messages, app.model.Activity, {
                converter: function (model) {
                  if (!model.published) {
                    model.published = model.created
                  }
                }
              })
              activities.replace(newActivities)
              this.fireEvent('refresh')
              this._subscribeToChannel(subscription.getChannel())
              this.fireEvent('subscriptionApplied')
            })
          } else {
            activities.removeAll()
            this.fireEvent('subscriptionApplied')
          }
        })
        this.getChildControl('header').setSubscription(subscription)
        this.getChildControl('header').show()
      } else {
        this.getChildControl('header').exclude()
      }
    },

    /**
     * Find activity by id
     * @param id {String} Activity ID
     * @returns {app.model.Activity|null}
     * @protected
     */
    _findActivity: function (id) {
      let found = null
      this.getActivities().some(act => {
        if (act.getId() === id) {
          found = act
          return true
        }
      })
      return found
    },

    /**
     * Delete activity from channel
     * @param ev {Event} event with activity instance as payload
     * @protected
     */
    _deleteActivity: function (ev) {
      const activity = ev.getData()
      if (this.isAllowed('d')) {
        app.io.Rpc.getProxy().deleteActivity(activity.getId()).then(res => {
          if (res === true) {
            this.debug('activity as been deleted')
          } else {
            this.error(res)
          }
        }).catch(err => {
          this.error(err)
        })
      } else {
        this.error('you are not allowed to delete activity', activity.getId())
      }
    },

    /**
     * Check is action is allowed in target
     * @param action {String} single action to check
     */
    isAllowed: function (action, target) {
      let acls, targetOwnerId
      if (!target) {
        target = this.getSubscription()
      }
      if (target instanceof app.model.Activity) {
        acls = this.getChannelActivitiesAcls()
        targetOwnerId = target.getActorId()
      } else if (target instanceof app.model.Subscription || target instanceof app.model.Channel) {
        targetOwnerId = target.getChannel().getOwnerId()
        acls = this.getChannelAcls()
      } else {
        this.error('unknown target type', target.classname)
        return false
      }
      let actionType = 'actions'
      if (app.Model.getInstance().getActor() && targetOwnerId === app.Model.getInstance().getActor().getId()) {
        actionType = 'ownerActions'
      } else if (this.getSubscription() instanceof app.model.Subscription && this.getSubscription().getChannelId() === target.getChannelId()) {
        actionType = 'memberActions'
      }
      return acls[actionType].includes(action)
    },

    /**
     * Share an activity (content) with other apps (only works in app context)
     * @protected
     */
    _shareActivity: function (ev) {
      const activity = ev.getData()
      if (app.Config.isApp) {
        // TODO
      } else {
        // share in another channel, show channel selection
        const dialog = new qx.ui.window.Window(this.tr('Select channel'), app.Config.icons.public + '/20')
        dialog.setLayout(new qx.ui.layout.Grow())
        dialog.set({
          centerOnAppear: true,
          centerOnContainerResize: true,
          contentPadding: 10,
          modal: true,
          movable: false,
          resizable: false
        })
        const list = new app.ui.list.Subscriptions(app.Model.getInstance().getSubscriptions(), {
          filter: (model) => {
            return !model.isHidden() && this.isAllowed('p', model) &&
              model.getChannel().getChannelId() !== this.getSubscription().getChannelId()
          }
        })
        dialog.add(list)
        list.getSelection().addListenerOnce('change', () => {
          const selection = list.getSelection()
          console.log(selection)
          if (selection.getLength() === 1) {
            const channel = selection.getItem(0).getChannel()
            app.io.Rpc.getProxy().publish(channel.getId(), {
              type: activity.getType(),
              title: activity.getTitle(),
              content: activity.getContent(),
              ref: activity.getId(),
              refType: 'share'
            }).then(() => {
              // open the channel
              dialog.close()
              app.ui.Menu.getInstance().getChildControl('list').getSelection().replace([selection.getItem(0)])
            }).catch(this.error)
          }
        })
        dialog.open()
        qx.core.Init.getApplication().getRoot().add(dialog, {left: 20, top: 20})
      }
    },

    /**
     * Handler for channel watching
     *
     * @param payload {Object} incoming data
     * @protected
     */
    _onActivity: function (payload) {
      if (payload.hasOwnProperty('a') && payload.hasOwnProperty('c')) {
        let found
        switch (payload.a) {
          case 'd':
            // delete
            found = this._findActivity(payload.c)
            if (found) {
              this.getActivities().remove(found)
            }
            this.fireEvent('refresh')
            break

          case 'u':
            // update
            found = this._findActivity(payload.c.id)
            if (found) {
              found.set(payload.c)
            } else {
              // add new activity
              if (!payload.c.published) {
                payload.c.published = payload.c.created
              }
              this.getActivities().push(app.model.Factory.create(payload.c, app.model.Activity))
            }
            this.fireEvent('refresh')
            break

          case 'a':
            if (!payload.c.published) {
              payload.c.published = payload.c.created
            }
            this.getActivities().push(app.model.Factory.create(payload.c, app.model.Activity))
            this.fireEvent('refresh')
            break

          case 'i':
            // internal messaging, like states, writing users etc
            switch (payload.c.type) {
              case 'write':
                if (payload.c.uid === app.Model.getInstance().getActor().getUsername()) {
                  // ignore ourselves
                  return
                }
                const model = this.__writingUsers

                model.addListener('changeLength', (ev) => {
                  if (ev.getData() === 0) {
                    this.getChildControl('status-bar').resetValue()
                  } else {
                    const last = ev.getData() - 1
                    this.getChildControl('status-bar').setValue(this.trn(
                      '%1 is writing...',
                      '%1 and %2 are writing...',
                      model.getLength(),
                      last > 0 ? model.slice(0, last).join(', ') : model.getItem(0),
                      last > 0 ? model.getItem(last) : null)
                    )
                  }
                })
                const label = payload.c.uid
                if (!model.includes(label)) {
                  model.push(label)
                  this.__writingUserTimers[label] = qx.event.Timer.once(function () {
                    model.remove(label)
                    delete this.__writingUserTimers[label]
                  }, this, 5000)
                } else if (payload.c.done) {
                  // user is done writing
                  model.remove(label)
                  this.__writingUserTimers[label].stop()
                  delete this.__writingUserTimers[label]
                } else if (this.__writingUserTimers[label]) {
                  this.__writingUserTimers[label].restart()
                } else {
                  this.__writingUserTimers[label] = qx.event.Timer.once(function () {
                    model.remove(label)
                    delete this.__writingUserTimers[label]
                  }, this, 5000)
                }
                break

              default:
                this.warning('unhandled internal message type: ', payload.c.type)
                break
            }
            break
        }
      } else {
        throw new Error('wrong activity payload')
      }
    },

    /**
     * Subscribe to the given channel if the user has the permission to to that.
     * @param channel {app.model.Channel} channel to subscribe to
     * @protected
     */
    _subscribeToChannel: function (channel) {
      const acl = this.getChannelAcls()
      if (acl.actions.includes('e')) {
        this.__currentSCChannel.subscribe()
        this.__currentSCChannel.on('subscribe', () => {
          this.__currentSCChannel.watch(this._onActivity.bind(this))
          this.__currentSCChannel.off('subscribe')
          this.__currentSCChannel.off('subscribeFail')
          this._handleSubscribed(true)
        })
        this.__currentSCChannel.on('subscribeFail', (err) => {
          this.error(err)
          this.__currentSCChannel.off('subscribe')
          this.__currentSCChannel.off('subscribeFail')
          this._handleSubscribed(false)
        })
      } else {
        // show subscription hint
        app.io.Rpc.getProxy().getAllowedActionsForRole('user', channel.getId()).then(userAcl => {
          this._handleSubscriptionAcl(userAcl.actions.includes('e'))
        })
      }
    },

    /**
     * Handle the case that the user is allowed to subscribe to this channel or not.
     * Inheriting classes can override this method to react to this situation.
     * @protected
     */
    _handleSubscriptionAcl: function (allowed) {
    },

    /**
     * Subscription post processing
     * Inheriting classes can override this method to react to this situation.
     * @param isSubscribed {Boolean} true if subscription was successful
     * @protected
     */
    _handleSubscribed: function (isSubscribed) {
    },

    // property apply
    _applyActivities: function (value) {
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'header':
          control = new app.ui.ChannelHeader()
          if (this.getSubscription()) {
            control.setSubscription(this.getSubscription())
          } else {
            control.exclude()
          }
          this._addAt(control, 0)
          break

        case 'status-bar':
          control = new qx.ui.basic.Label()
          this._addAt(control, 2)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
