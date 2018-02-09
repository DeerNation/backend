/**
 * Abstract base class for all model classes
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.model.AbstractModel', {
  extend: qx.core.Object,
  type: 'abstract',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments)
    if (props) {
      this._detachBackend = true
      this.set(props)
      this._detachBackend = false
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    id: {
      check: 'String',
      init: null,
      event: 'changedId'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _detachBackend: false,

    _transformDate: function (value) {
      if (qx.lang.Type.isString(value)) {
        return new Date(value)
      }
      return value
    },

    // property apply
    _persistProperty: function (value, old, name) {
      if (!this._detachBackend) {
        app.io.Rpc.getProxy().updateObjectProperty(this.basename, this.getId(), name, value)
      }
    }
  }
})
