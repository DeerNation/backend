/**
 * Rich Label
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.basic.Label', {
  extend: qx.ui.basic.Label,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (value) {
    this.base(arguments, value)
    this.set({
      anonymous: true,
      rich: true,
      wrap: true,
      selectable: true
    })
  }
})
