/**
 * Menu
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.mobile.ui.Menu', {
  extend: app.ui.BaseMenu,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)

    this._createChildControl('menu-button')
    this.getChildControl('list')
    this._createChildControl('searchbox')
    this._createChildControl('addchannel-button')
    this._createChildControl('logo')
  }
})
