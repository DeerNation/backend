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
      event: 'changedMessage',
      apply: '_applyMessage'
    },

    /**
     * Transformed message (markdown -> HTML)
     */
    displayMessage: {
      check: 'String',
      nullable: true,
      event: 'changedDisplayMessage'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyMessage: function (value) {
      this.setDisplayMessage(app.data.converter.Markdown.convert(value))
    }
  },

  defer: function (statics) {
    app.model.activity.Registry.getInstance().register('message', statics, app.ui.renderer.Message, app.ui.form.MessageField)
  }
})
