/**
 * Menu
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.Menu', {
  extend: qx.ui.core.Widget,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())

    const childControls = ['actor', 'list']
    childControls.forEach(this._createChildControl, this)
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
      init: null,
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

    // property apply
    _applyActor: function (value) {
      this.getChildControl('actor').setValue(value.getName())
    },

    _onSelection: function () {
      app.Model.getInstance().setSelectedSubscription(this.getChildControl('list').getSelection().getItem(0))
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'actor':
          control = new qx.ui.basic.Label()
          this._addAt(control, 0)
          break

        case 'list':
          control = new qx.ui.list.List(app.Model.getInstance().getSubscriptions())
          control.setDelegate({

            configureItem: function(item) {
              item.setAppearance('channel-listitem')
            },

            bindItem: function (controller, item, index) {
              controller.bindProperty('', 'model', null, item, index)
              controller.bindProperty('channel.title', 'label', {
                converter: function (value, model) {
                  let icon = model.getChannel().getType() === 'PRIVATE' ? '$' : '#'
                  return icon + ' ' + value
                }
              }, item, index)
            },

            group: function (subscription) {
              switch (subscription.getChannel().getType()) {
                case 'PUBLIC':
                  if (subscription.isFavorite()) {
                    return qx.locale.Manager.tr('Favorites')
                  }
                  return qx.locale.Manager.tr('Channels')

                case 'PRIVATE':
                  return qx.locale.Manager.tr('Private channels')
              }
            },

            configureGroupItem: function (item) {
              item.setAppearance('channel-group-item')
            },

            sorter: function (a, b) {
              if (a.isFavorite()) {
                if (b.isFavorite()) {
                  return a.getChannel().getName().localeCompare(b.getChannel().getName())
                } else {
                  return -1
                }
              } else if (b.isFavorite()) {
                return 1
              } else if (a.getChannel().getType() === 'PUBLIC') {
                if (b.getChannel().getType() === 'PUBLIC') {
                  return a.getChannel().getName().localeCompare(b.getChannel().getName())
                } else {
                  return -1
                }
              } else {
                return 1
              }
            }
          })

          control.getSelection().addListener('change', this._onSelection, this)

          this._addAt(control, 1, {flex: 1})
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
