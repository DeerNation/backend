/**
 * MessageField
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.form.MessageField', {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IModel],

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.HBox())

    // this._createChildControl('emojis')
    this._createChildControl('textfield')
    this._createChildControl('send-button')
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    model: {
      nullable: true,
      event: 'changeModel',
      dereference: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    postMessage: function () {
      if (this.getChannel()) {
        app.io.Rpc.getProxy().publish(this.getModel().getId(), {
          type: 'Message',
          content: {
            message: this.getChildControl('textfield').getValue()
          }
        })
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'emojis':
          control = new qx.ui.form.Button(null, app.Config.icons.smiley + '/20')
          this._addAt(control, 0)
          break

        case 'textfield':
          control = new qx.ui.form.TextArea()
          this._addAt(control, 1, {flex: 1})
          break

        case 'send-button':
          control = new qx.ui.form.Button(null, app.Config.icons.plus + '/20')
          control.addListener('execute', this.postMessage, this)
          this._addAt(control, 2)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
