/**
 * Activity
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.model.activity.content.AbstractActivityContent', {
  extend: qx.core.Object,
  type: 'abstract',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments)
    this.set(props)
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
