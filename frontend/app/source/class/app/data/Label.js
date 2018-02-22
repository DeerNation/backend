/**
 * Label
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

/**
 * Simple class to be used for label lists.
 */
qx.Class.define('app.data.Label', {
  extend: qx.core.Object,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (label) {
    this.base(arguments)
    if (label) {
      this.setLabel(label)
    }
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    __cache: {},

    get: function (name) {
      if (!this.__cache.hasOwnProperty(name)) {
        this.__cache[name] = new app.data.Label(name)
      }
      return this.__cache[name]
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    label: {
      check: 'String',
      nullable: true,
      event: 'changedLabel'
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    delete app.data.Label.__cache[this.getLabel()]
  }
})
