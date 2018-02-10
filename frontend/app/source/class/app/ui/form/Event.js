/**
 * Form to edit or create and Event activity
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.form.Event', {
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

    // this._createChildControl('textfield')
    // this._createChildControl('send-button')
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

    postEvent: function () {
      if (this.getChannel()) {
        app.io.Rpc.getProxy().publish(this.getModel().getId(), {
          type: 'Message',
          content: {
            title: this.getChildControl('title').getValue()
          }
        })
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'title':
          control = new qx.ui.form.TextField()
          this._add(control)
          break

        case 'send-button':
          control = new qx.ui.form.Button(null, app.Config.icons.plus + '/20')
          control.addListener('execute', this.postEvent, this)
          this._add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
