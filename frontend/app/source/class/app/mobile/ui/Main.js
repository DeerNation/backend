/**
 * Main
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.mobile.ui.Main', {
  extend: qx.ui.container.Stack,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._createChildControl('menu')
    this._createChildControl('channel')

    app.Model.getInstance().addListener('changedSelectedSubscription', this._onSelectedSubscription, this)
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
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    /**
     * Show Channel page on stack if subscription is selected, or the menu if not
     * @protected
     */
    _onSelectedSubscription: function (ev) {
      if (ev.getData()) {
        this.setSelection([this.getChildControl('channel')])
      } else {
        this.setSelection([this.getChildControl('menu')])
      }
    },

     // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'menu':
          control = new app.mobile.ui.Menu()
          this.add(control)
          break

        case 'channel': {
          control = new app.ui.Channel()
          this.add(control)
          break
        }
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
    app.Model.getInstance().removeListener('changedSelectedSubscription', this._onSelectedSubscription, this)
  }
})
