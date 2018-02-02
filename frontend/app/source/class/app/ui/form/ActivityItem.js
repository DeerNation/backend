/**
 * ActivityItem
 *
 * @author tobiasb
 * @since 2018
 * @ignore(showdown)
 */

qx.Class.define('app.ui.form.ActivityItem', {
  extend: qx.ui.form.ListItem,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function(label, icon, model) {
    this.base(arguments, label, icon, model)
    this.__converter = new showdown.Converter()
  },


  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    message: {
      check: "String",
      nullable: true,
      apply: "_applyMessage"
    },

    rich: {
      refine: true,
      init: true
    }
  },


  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __converter: null,

    // property apply
    _applyMessage: function(value) {
      this.setLabel(this.__converter.makeHtml(value))
    }
  }

});