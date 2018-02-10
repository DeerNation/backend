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
  }
})
