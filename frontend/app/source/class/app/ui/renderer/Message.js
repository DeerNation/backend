/**
 * Message
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.renderer.Message', {
  extend: qx.ui.core.Widget,
  implement: app.ui.renderer.IRenderer,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())
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
      apply: '_applyModel',
      dereference: true
    },

    appearance: {
      refine: true,
      init: 'message-activity'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _applyModel: function (value, old) {
      if (old) {
        old.removeRelatedBindings(this.getChildControl('title'))
        old.getContentObject() && old.getContentObject().removeRelatedBindings(this.getChildControl('message'))
      }
      if (value) {
        let control = this.getChildControl('title')
        value.bind('displayTitle', this.getChildControl('title'), 'value', {
          converter: function (value) {
            if (value) {
              control.show()
              return value
            } else {
              control.exclude()
              return value
            }
          }
        })
        const content = value.getContentObject()
        if (content) {
          content.bind('displayMessage', this.getChildControl('message'), 'value')
        }
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'title':
          control = new app.ui.basic.Label()
          this._addAt(control, 0)
          break

        case 'message':
          control = new app.ui.basic.Label()
          this._addAt(control, 1, {flex: 1})
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
