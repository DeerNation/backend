/**
 * SubscriptionItem
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.form.SubscriptionItem', {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IModel],

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (label, icon, model) {
    this.base(arguments, label, icon, model)
    this._setLayout(new qx.ui.layout.HBox())
    this._getLayout().setAlignY('middle')

    this.addListener('pointerover', this._onPointerOver, this)
    this.addListener('pointerout', this._onPointerOut, this)
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events: {
    /** (Fired by {@link qx.ui.form.List}) */
    'action': 'qx.event.type.Event'
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'channel-listitem'
    },

    model: {
      nullable: true,
      event: 'changeModel',
      apply: '_applyModel',
      dereference: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __menu: null,
    __visibilityButton: null,
    __favoriteButton: null,
    __unsubscribeButton: null,

    // apply method
    _applyModel: function (value, old) {
      if (old) {
        old.getChannel().removeRelatedBindings(this)
        old.removeRelatedBindings(this)
      }
      if (value) {
        value.bind('icon', this.getChildControl('type'), 'source')
        value.getChannel().bind('title', this.getChildControl('name'), 'value')
        value.getChannel().bind('color', this.getChildControl('icon'), 'backgroundColor')
        const iconString = value.getChannel().getTitle().substring(0, 1).toUpperCase()
        this.getChildControl('icon').setLabel(iconString)

        if (this.__favoriteButton) {
          if (this.getModel().isFavorite()) {
            this.__favoriteButton.set({
              label: this.tr('Unfavorite'),
              icon: app.Config.icons.favorite + '/20'
            })
          } else {
            this.__favoriteButton.set({
              label: this.tr('Favorite'),
              icon: app.Config.icons.noFavorite + '/20'
            })
          }
        }
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control

      switch (id) {
        case 'icon':
          control = new qx.ui.basic.Atom()
          this._addAt(control, 0)
          break

        case 'type':
          control = new qx.ui.basic.Image()
          this._addAt(control, 1)
          break

        case 'name':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this._addAt(control, 2, {flex: 1})
          break

        case 'last-activity':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this._addAt(control, 3)
          break

        case 'unread':
          control = new qx.ui.basic.Atom()
          this._addAt(control, 4)
          break

        case 'menu-button':
          control = new qx.ui.form.MenuButton(null, app.Config.icons.menu + '/12', this.__generateMenu())
          control.hide()
          this._addAt(control, 5)
          break
      }
      return control || this.base(arguments, id, hash)
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      focused: true,
      hovered: true,
      selected: true,
      dragover: true
    },

    __generateMenu: function () {
      if (!this.__menu) {
        let menu = this.__menu = new qx.ui.menu.Menu()
        this.__visibilityButton = new qx.ui.menu.Button(this.tr('Hide room'), app.Config.icons.hide + '/20')
        this.__visibilityButton.addListener('execute', this._toggleChannelVisibility, this)
        menu.add(this.__visibilityButton)

        if (this.getModel() && this.getModel().isFavorite()) {
          this.__favoriteButton = new qx.ui.menu.Button(this.tr('Unfavorite'), app.Config.icons.favorite + '/20')
        } else {
          this.__favoriteButton = new qx.ui.menu.Button(this.tr('Favorite'), app.Config.icons.noFavorite + '/20')
        }
        this.__favoriteButton.addListener('execute', this._toggleFavorite, this)
        menu.add(this.__favoriteButton)

        this.__unsubscribeButton = new qx.ui.menu.Button(this.tr('Leave room'), app.Config.icons.unsubscribe + '/20')
        this.__unsubscribeButton.addListener('execute', this._deleteSubscription, this)
        menu.add(this.__unsubscribeButton)
      }
      return this.__menu
    },

    _toggleChannelVisibility: function () {
      this.getModel().toggleHidden()
      qx.event.message.Bus.dispatchByName('menu.subscription.update', true)
    },

    _toggleFavorite: function () {
      this.getModel().toggleFavorite()
      qx.event.message.Bus.dispatchByName('menu.subscription.update', true)
    },

    _deleteSubscription: function () {
      dialog.Dialog.confirm(this.tr('Do you really want to leave this room?'), (confirmed) => {
        if (confirmed === true) {
          this.getModel().delete()
        }
      })
    },

    /**
     * Event handler for the pointer over event.
     */
    _onPointerOver: function () {
      this.addState('hovered')
      this.getChildControl('menu-button').show()
    },

    /**
     * Event handler for the pointer out event.
     */
    _onPointerOut: function () {
      this.removeState('hovered')
      if (!this.__menu.isVisible()) {
        this.getChildControl('menu-button').hide()
      } else {
        this.__menu.addListenerOnce('disappear', this.getChildControl('menu-button').hide, this.getChildControl('menu-button'))
      }
    }
  },

  destruct: function () {
    this._disposeObjects('__menu', '__visibilityButton', '__favoriteButton', '__unsubscribeButton')

    this.removeListener('pointerover', this._onPointerOver, this)
    this.removeListener('pointerout', this._onPointerOut, this)
  }
})
