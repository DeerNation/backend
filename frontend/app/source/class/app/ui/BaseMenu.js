/**
 * base class for the Menu classes on the different targets (e.g. mobile, desktop, ...)
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.BaseMenu', {
  extend: qx.ui.core.Widget,
  type: 'abstract',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())

    app.Model.getInstance().bind('actor', this, 'actor')
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    /**
     * Currently logged in Actor
     */
    actor: {
      check: 'app.model.Actor',
      nullable: true,
      apply: '_applyActor'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __subscribedChannel: null,
    _statesMap: {
      online: qx.locale.Manager.tr('Online'),
      away: qx.locale.Manager.tr('Away'),
      busy: qx.locale.Manager.tr('Busy'),
      invisible: qx.locale.Manager.tr('Invisible')
    },

    // property apply
    _applyActor: function (value, old) {
      if (old) {
        old.removeListener('changedOnline', this._onActorOnline, this)
        old.removeListener('changedStatus', this._onActorOnline, this)
      }
      if (value) {
        value.bind('name', this.getChildControl('actor-name'), 'value')
        value.addListener('changedOnline', this._onActorOnline, this)
        value.addListener('changedStatus', this._onActorOnline, this)
        this._onActorOnline()

        const actorIconBox = this.getChildControl('actor-icon-box')
        actorIconBox.removeAll()
        actorIconBox.add(value.getIcon())
        this.getChildControl('list').setModel(app.Model.getInstance().getSubscriptions())
        this.getChildControl('actor-container').show()
      } else {
        this.getChildControl('actor-container').hide()
        this.getChildControl('list').setModel(app.Model.getInstance().getChannels())
      }
    },

    _onActorOnline: function () {
      const value = this.getActor().isOnline()
      let status = this.getActor().getStatus()
      if (status === 'online') {
        if (value === false) {
          status = 'offline'
        }
        this.getChildControl('actor-status').set({
          label: value ? this.tr('Online') : this.tr('Offline')
        })
      } else {
        this.getChildControl('actor-status').set({
          label: this._statesMap[status]
        })
      }
      this.getChildControl('actor-status').getChildControl('icon').setTextColor('user-' + status)
    },

    _onSelection: function () {
      const selection = this.getChildControl('list').getSelection()
      if (selection.getLength() === 1) {
        app.Model.getInstance().setSelectedSubscription(selection.getItem(0))
      } else {
        app.Model.getInstance().resetSelectedSubscription()
      }
    },

    /**
     * Opens the user menu
     * @protected
     */
    _openUserMenu: function () {
      this.__menu && this.__menu.open()
    },

    _openNewChannelForm: function () {
      dialog.Dialog.form(this.tr('Add a new channel'), {
        private: {
          type: 'CheckBox',
          label: this.tr('Private channel'),
          value: false
        },
        writeProtected: {
          type: 'CheckBox',
          label: this.tr('Write-protected channel'),
          value: false
        },
        name: {
          type: 'TextField',
          label: this.tr('Channel name'),
          value: ''
        }
      }, function (data) {
        if (data) {
          if (!data.name) {
            this.error('No channel name defined')
            return
          }
          // create this channel
          app.io.Rpc.getProxy().createChannel(data)
        }
      }.bind(this))
    },

    __generateMenu: function () {
      let menu = this.__menu = new qx.ui.menu.Menu()

      Object.entries(this._statesMap).forEach(([name, title]) => {
        let button = new qx.ui.menu.Button(title, app.Config.icons.online + '/8')
        button.getChildControl('icon').setTextColor('user-' + name)
        button.addListener('execute', () => {
          app.Model.getInstance().getActor().setStatus(name)
        })
        menu.add(button)
      })

      menu.add(new qx.ui.menu.Separator())

      const dev = new qx.ui.menu.RadioButton(this.tr('Develop'))
      dev.setUserData('type', 'dev')
      const prod = new qx.ui.menu.RadioButton(this.tr('Productive'))
      prod.setUserData('type', 'prod')
      menu.add(dev)
      menu.add(prod)

      const group = new qx.ui.form.RadioGroup(dev, prod)
      group.addListener('changeSelection', ev => {
        switch (ev.getData()[0].getUserData('type')) {
          case 'dev':
            app.Config.socket.hostname = 'hannibal'
            app.Config.socket.secure = false
            break

          case 'prod':
            app.Config.socket.hostname = 'app.hirschberg-sauerland.de'
            app.Config.socket.secure = true
            break
        }
        qx.bom.Storage.getLocal().setItem('socket', app.Config.socket)
        app.io.Socket.getInstance().connect()
      })

      menu.add(new qx.ui.menu.Separator())

      let button = new qx.ui.menu.Button(this.tr('Logout'), app.Config.icons.logout + '/16')
      button.addListener('execute', () => {
        app.io.Socket.getInstance().logout()
      })
      menu.add(button)
      return menu
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'actor-container':
          const layout = new qx.ui.layout.Grid()
          layout.setColumnFlex(1, 1)
          control = new qx.ui.container.Composite(layout)
          control.addListener('tap', this._openUserMenu, this)
          this._addAt(control, 0)
          break

        case 'actor-icon-box':
          control = new qx.ui.container.Composite(new qx.ui.layout.Grow())
          control.setAnonymous(true)
          this.getChildControl('actor-container').add(control, {row: 0, column: 0, rowSpan: 2})
          break

        case 'actor-name':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this.getChildControl('actor-container').add(control, {row: 0, column: 1})
          break

        case 'actor-status':
          control = new qx.ui.basic.Atom()
          control.setAnonymous(true)
          this.getChildControl('actor-container').add(control, {row: 1, column: 1})
          break

        case 'menu-button':
          control = new qx.ui.form.MenuButton(null, app.Config.icons.menu + '/14', this.__generateMenu())
          control.setAnonymous(true)
          this.getChildControl('actor-container').add(control, {row: 0, column: 2, rowSpan: 2})
          break

        case 'searchbar-container':
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox())
          this._addAt(control, 1)
          break

        case 'searchbox':
          control = new qx.ui.form.VirtualComboBox()
          control.getChildControl('textfield').setPlaceholder(this.tr('Search (^ +K)'))
          control.getChildControl('button').exclude()
          this.getChildControl('searchbar-container').addAt(control, 0, {flex: 1})
          break

        case 'addchannel-button':
          control = new qx.ui.form.Button('+')
          control.addListener('execute', this._openNewChannelForm, this)
          this.getChildControl('searchbar-container').addAt(control, 1)
          break

        case 'list':
          control = new qx.ui.list.List(this.getActor()
            ? app.Model.getInstance().getSubscriptions()
            : app.Model.getInstance().getChannels())
          control.setDelegate({

            createItem: function () {
              return new app.ui.form.SubscriptionItem()
            },

            bindItem: function (controller, item, index) {
              controller.bindProperty('', 'model', null, item, index)
            },

            group: function (subscription) {
              if (subscription.isFavorite()) {
                return qx.locale.Manager.tr('Favorites')
              }
              switch (subscription.getChannel().getType()) {
                case 'PUBLIC':
                  return qx.locale.Manager.tr('Channels')

                case 'PRIVATE':
                  return qx.locale.Manager.tr('Private channels')
              }
            },

            configureGroupItem: function (item) {
              item.setAppearance('channel-group-item')
            },

            filter: function (model) {
              return !model.isHidden()
            },

            sorter: function (a, b) {
              if (a.isFavorite()) {
                if (b.isFavorite()) {
                  return a.getChannel().getTitle().localeCompare(b.getChannel().getTitle())
                } else {
                  return -1
                }
              } else if (b.isFavorite()) {
                return 1
              } else if (a.getChannel().getType() === 'PUBLIC') {
                if (b.getChannel().getType() === 'PUBLIC') {
                  return a.getChannel().getTitle().localeCompare(b.getChannel().getTitle())
                } else {
                  return -1
                }
              } else {
                return 1
              }
            }
          })

          control.getSelection().addListener('change', this._onSelection, this)

          qx.event.message.Bus.subscribe('menu.subscription.update', control.refresh, control)

          this._addAt(control, 2, {flex: 1})
          break

        case 'logo':
          control = new qx.ui.basic.Atom(null, qx.util.ResourceManager.getInstance().toUri('app/logo.png'))
          control.setCenter(true)
          control.getChildControl('icon').set({
            maxWidth: 200,
            maxHeight: 65,
            scale: true
          })
          this._addAt(control, 3)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    app.Model.getInstance().removeRelatedBindings(this)
  }
})
