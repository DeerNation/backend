/**
 * Main
 *
 * @author tobiasb
 * @since 2018
 * @require(app.ui.Menu)
 * @require(app.mobile.ui.Menu)
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
    this._createChildControl('channel')

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
      check: ['channel', 'calendar'],
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
        if (channel.getView() === 'calendar') {
          this.setShow('calendar')
          this.getChildControl('calendar').setSubscription(subscription)
        } else {
          this.setShow('channel')
          this.getChildControl('channel').setSubscription(subscription)
        }
      }
    },

    // property apply
    _applyShow: function (value, old) {
      if (old) {
        this.getChildControl(old).resetSubscription()
      }
      if (value) {
        this.getChildControl('channel-stack').setSelection([this.getChildControl(value)])
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'menu':
          control = new app.ui.Menu()
          this.add(control)
          break

        case 'channel-stack':
          control = new qx.ui.container.Stack()
          this.add(control, 1)
          break

        case 'channel':
          control = new app.ui.channel.Messages()
          this.getChildControl('channel-stack').add(control)
          break

        case 'calendar':
          control = new app.ui.channel.Events()
          this.getChildControl('channel-stack').add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }

})
