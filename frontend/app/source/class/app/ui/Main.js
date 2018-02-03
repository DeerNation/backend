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
    this.base(arguments, 'vertical')
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
     // overridden
    _createChildControlImpl: function (id, hash) {
      var control
      switch (id) {
        case 'menu':
          control = new app.ui.Menu()
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }

})
