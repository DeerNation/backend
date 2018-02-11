/**
 * Menu
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.Menu', {
  extend: app.ui.BaseMenu,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())

    this._createChildControl('menu-button')
    this._createChildControl('list')
    this._createChildControl('searchbox')
    this._createChildControl('addchannel-button')
    this._createChildControl('logo')
  }
})
