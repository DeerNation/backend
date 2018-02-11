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
    }
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
          control = new app.ui.Menu()
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
