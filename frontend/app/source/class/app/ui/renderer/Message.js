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
        old.removeRelatedBindings(this)
      }
      if (value) {
        value.bind('title', this.getChildControl('title'), 'value', {
          converter: app.data.converter.Markdown.convert
        })
        value.bind('contentObject.message', this.getChildControl('message'), 'value', {
          converter: app.data.converter.Markdown.convert
        })
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'title':
          control = new qx.ui.basic.Label()
          control.set({
            anonymous: true,
            rich: true,
            wrap: true,
            selectable: true
          })
          this._addAt(control, 0)
          break

        case 'message':
          control = new qx.ui.basic.Label()
          control.set({
            anonymous: true,
            rich: true,
            wrap: true,
            selectable: true
          })
          this._addAt(control, 1, {flex: 1})
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
