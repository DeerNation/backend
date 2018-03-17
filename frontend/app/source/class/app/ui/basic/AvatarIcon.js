/**
 * AvatarIcon
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.basic.AvatarIcon', {
  extend: qx.ui.basic.Atom,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'avatar-icon'
    },
    title: {
      check: 'String',
      nullable: true,
      apply: '_applyTitle'
    },

    show: {
      refine: true,
      init: 'label'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    _applyTitle: function (value) {
      if (value) {
        value = value.substring(0, 1).toUpperCase()
      }
      this.setLabel(value)
    }
  }
})
