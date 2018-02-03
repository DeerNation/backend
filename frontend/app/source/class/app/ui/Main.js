/**
 * Main
 *
 * @author tobiasb
 * @since 2018
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
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
     // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'menu':
          control = app.ui.Menu.getInstance()
          this.add(control)
          break
        case 'channel': {
          control = new app.ui.Channel()
          this.add(control, 1)
          break
        }
      }
      return control || this.base(arguments, id, hash)
    }
  }

})
