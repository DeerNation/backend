/**
 * Message
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @require(app.model.activity.Registry)
 */

qx.Class.define('app.model.activity.content.Message', {
  extend: app.model.activity.content.AbstractActivityContent,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    message: {
      check: 'String',
      nullable: true,
      event: 'changesMessage'
    }
  },

  defer: function (statics) {
    app.model.activity.Registry.getInstance().register('message', statics, app.ui.renderer.Message, app.ui.form.MessageField)
  }
})
