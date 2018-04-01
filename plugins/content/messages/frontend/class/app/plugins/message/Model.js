/**
 * Message model
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @require(app.model.activity.Registry)
 */

qx.Class.define('app.plugins.message.Model', {
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
    },

    link: {
      check: 'String',
      nullable: true,
      event: 'changeLink'
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
  }
})
