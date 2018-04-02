/**
 * Main
 *
 * @author tobiasb
 * @since 2018
 * @require(app.ui.Menu)
 * @require(app.mobile.ui.Menu)
 * @require(app.ui.channel.View)
 */

qx.Class.define('app.ui.Main', {
  extend: qx.ui.splitpane.Pane,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments, 'horizontal')
    this._createChildControl('menu')

    // bind to global selected subscription
    app.Model.getInstance().bind('selectedSubscription', this, 'subscription')

    this.getChildControl('splitter').set({
      anonymous: true,
      width: 0,
      maxWidth: 0,
      height: 0,
      maxHeight: 0
    })
  },

  /*
 ******************************************************
   PROPERTIES
 ******************************************************
 */
  properties: {
    appearance: {
      refine: true,
      init: 'main'
    },

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

    show: {
      check: function (value) {
        return app.plugins.Registry.hasView(value)
      },
      init: 'channel',
      apply: '_applyShow'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    // property apply
    _applySubscription: function (subscription, oldSubscription) {
      if (subscription) {
        const channel = subscription.getChannel()
        const viewName = channel.getView()
        if (app.plugins.Registry.hasView(viewName)) {
          this.setShow(viewName)
          app.plugins.Registry.getViewInstance(viewName).setSubscription(subscription)
        } else {
          // channel view is the default
          this.setShow('channel')
          this.getChildControl('channel').setSubscription(subscription)
        }
      }
    },

    // property apply
    _applyShow: function (value, old) {
      if (old) {
        const oldView = app.plugins.Registry.getViewInstance(old)
        if (oldView) {
          oldView.resetSubscription()
        }
      }
      if (value) {
        const viewConfig = app.plugins.Registry.getViewConfig(value)
        if (!viewConfig.instance) {
          viewConfig.instance = new viewConfig.Clazz()
          this.getChildControl('channel-stack').add(viewConfig.instance)
        }
        this.getChildControl('channel-stack').setSelection([viewConfig.instance])
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'menu':
          control = app.ui.Menu.getInstance()
          this.add(control)
          break

        case 'channel-stack':
          control = new qx.ui.container.Stack()
          this.add(control, 1)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }

})
