/**
 * Image
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.basic.Image', {
  extend: qx.ui.basic.Image,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    cover: {
      check: 'Boolean',
      init: false,
      themeable: true,
      apply: '_applyCover'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyCover: function (value) {
      if (value) {
        // set background size on current element (div or img)
        this.getContentElement().setStyle('background-size', this.getMaxWidth() + 'px')
      } else {
        this.getContentElement().setStyle('background-size', null)
      }
    }
  }
})
