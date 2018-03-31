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
    this.addListener('swipe', this._onSwipe, this)
    this.setSelectedActivities(new qx.data.Array())

    qx.event.message.Bus.subscribe('channel.activities.delete', this._onActivityDelete, this)

    this._debouncedFireEvent = qx.util.Function.debounce(this.fireEvent.bind(this), 100)
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

    selectedActivities: {
      check: 'qx.data.Array',
      init: null
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
        const initial = (activities === null)
        if (initial) {
          activities = new qx.data.Array()
        }
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
              if (initial === true) {
                this.setActivities(activities)
              } else {
                this.fireEvent('refresh')
              }
              this._subscribeToChannel(subscription.getChannel())
              this.fireEvent('subscriptionApplied')
            })
          } else {
            activities.removeAll()
            if (initial === true) {
              this.setActivities(activities)
            }
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
      const activity = ev instanceof app.model.Activity ? ev : ev.getData()
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
     * @param target {app.model.Activity} activity the action should be checked for
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
     * Share an activity (content) with other apps (only works in app context) or on other channels
     * @param data {app.model.Activity|qx.data.Array|Event}
     * @protected
     */
    _shareActivity: function (data) {
      let activities = (data instanceof app.model.Activity || data instanceof qx.data.Array) ? data : data.getData()
      if (!qx.lang.Type.isArray(activities)) {
        activities = [activities]
      }
      if (app.Config.isApp) {
        // TODO: implement sharing in app context
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
          let message

          if (selection.getLength() === 1) {
            const channel = selection.getItem(0).getChannel()
            const promises = []
            activities.forEach(activity => {
              message = {
                type: activity.getType(),
                content: activity.getContent(),
                ref: activity.getId(),
                refType: 'share'
              }
              if (activity.getTitle()) {
                message.title = activity.getTitle()
              }
              promises.push(app.io.Rpc.getProxy().publish(channel.getId(), message))
            })
            Promise.all(promises).then(() => {
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
            this._debouncedFireEvent('refresh')
            break

          case 'u':
            // update
            found = this._findActivity(payload.c.id)
            if (found) {
              this.debug('updating existing activity', payload.c.id)
              found.set(payload.c)
            } else {
              // add new activity
              if (!payload.c.published) {
                payload.c.published = payload.c.created
              }
              this.debug('not activity to update found, creating new one')
              this.getActivities().push(app.model.Factory.create(payload.c, app.model.Activity))
            }
            this._debouncedFireEvent('refresh')
            break

          case 'a':
            if (!payload.c.published) {
              payload.c.published = payload.c.created
            }
            this.getActivities().push(app.model.Factory.create(payload.c, app.model.Activity))
            this._debouncedFireEvent('refresh')
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

    /**
     * Show context menu for selected activity
     * @param ev
     * @private
     */
    _onActivityContext: function (ev) {
      let activity
      if (ev instanceof qx.event.type.Event && ev.getType() === 'longtap') {
        activity = ev.getCurrentTarget().getModel()
      } else {
        activity = ev.getData()
      }
      const selectedActivities = this.getSelectedActivities()
      if (!selectedActivities.includes(activity)) {
        selectedActivities.push(activity)
      }
      activity.setMarked(true)
      const bar = this.getChildControl('context-bar')
      // update button states
      const deleteable = selectedActivities.filter((act) => {
        return this.isAllowed('d', act)
      })
      if (deleteable.length === 0) {
        this.getChildControl('delete-button').exclude()
      } else {
        this.getChildControl('delete-button').show()
      }
      if (!this.hasChildControl('share-button')) {
        this._createChildControl('share-button')
      }

      this.getChildControl('header-stack').setSelection([bar])

      // TODO enter simple selection mode for list (tap -> (de-)select)
    },

    /**
     * Handle actions fired from ActiivityItems , e.g. delete, share, ...
     * @param ev {Event}
     * @protected
     */
    _onActivityAction: function (ev) {
      const data = ev instanceof qx.event.type.Event ? ev.getData() : ev
      if (data.activity) {
        switch (data.action) {
          case 'delete':
            this.getSelectedActivities.forEach(this._deleteActivity, this)
            break

          case 'share':
            this._shareActivity(this.getSelectedActivities())
            break
        }
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'header-stack':
          control = new qx.ui.container.Stack()
          this._addAt(control, 0)
          break

        case 'header':
          control = new app.ui.ChannelHeader()
          if (this.getSubscription()) {
            control.setSubscription(this.getSubscription())
          } else {
            control.exclude()
          }
          this.getChildControl('header-stack').add(control)
          break

        case 'context-bar':
          control = new app.ui.toolbar.ToolBar()
          control.set({
            show: 'icon'
          })
          control.exclude()
          const back = this.getChildControl('back-button')
          control.add(back)
          control.add(this.getChildControl('selection-counter'))
          this.getChildControl('selection-counter').setShow('label')
          control.addSpacer()
          this.getChildControl('header-stack').add(control)
          break

        case 'selection-counter':
          control = new qx.ui.basic.Atom('' + this.getSelectedActivities().length)
          control.setUserData('showOverride', true)
          if (this.getSelectedActivities().length === 0) {
            control.exclude()
          } else {
            control.show()
          }
          this.getSelectedActivities().addListener('changeLength', (ev) => {
            control.setLabel('' + ev.getData())
            if (ev.getData() === 0) {
              control.exclude()
            } else {
              control.show()
            }
          })
          break

        case 'back-button':
          control = new qx.ui.toolbar.Button(this.tr('Back'), app.Config.icons.back)
          control.addListener('execute', () => {
            this.getSelectedActivities().removeAll().forEach(act => {
              act.setMarked(false)
            })
            this.getChildControl('header-stack').setSelection([this.getChildControl('header')])
          })
          control.addState('first')
          break

        case 'delete-button':
          control = new qx.ui.toolbar.Button(this.tr('Delete'), app.Config.icons.delete + '/22')
          control.addListener('execute', () => {
            this._onActivityAction({
              action: 'delete'
            })
          })
          this.getChildControl('context-bar').add(control)
          break

        case 'share-button':
          control = new qx.ui.toolbar.Button(this.tr('Share'), app.Config.icons.share + '/22')
          control.addListener('execute', () => {
            this._onActivityAction({
              action: 'share'
            })
          })
          if (app.Config.target === 'desktop') {
            // on desktop we can only share in other channels, the user has to be logged in to do that
            app.Model.getInstance().bind('actor', control, 'enabled', {
              converter: function (value) {
                return !!value
              }
            })
          }
          this.getChildControl('context-bar').add(control)
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
