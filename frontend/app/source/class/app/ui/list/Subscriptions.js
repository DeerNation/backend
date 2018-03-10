/**
 * Suscriptions list for current actor
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.ui.list.Subscriptions', {
  extend: qx.ui.list.List,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (model, delegateOverride) {
    this.base(arguments, model)
    this.__initDelegate(delegateOverride)
    qx.event.message.Bus.subscribe('menu.subscription.update', this.refresh, this)
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __initDelegate: function (override) {
      this.setDelegate(Object.assign(this._createDefaultDelegate(), override || {}))
    },

    _createDefaultDelegate: function () {
      return {
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
      }
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    qx.event.message.Bus.unsubscribe('menu.subscription.update', this.refresh, this)
  }
})
