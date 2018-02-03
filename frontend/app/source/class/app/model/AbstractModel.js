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
      this.set(props)
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    _transformDate: function (value) {
      if (qx.lang.Type.isString(value)) {
        return new Date(value)
      }
      return value
    }
  }
})
