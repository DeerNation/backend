/**
 * Message model
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @require(app.model.activity.Registry)
 */

qx.Mixin.define('app.plugins.message.MMessage', {

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.addListener('changeContent', this._refreshDisplayMessage, this)
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {

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
    /**
     * Update displayMessage property value by converting the message content with the markdown converter.
     * @protected
     */
    _refreshDisplayMessage: function () {
      this.setDisplayMessage(app.data.converter.Markdown.convert(this.getContent()))
    }
  }
})
