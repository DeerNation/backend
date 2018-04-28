/**
 * MessageField
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.plugins.message.MessageField', {
  extend: app.plugins.AbstractContentForm,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.HBox())
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'message-editor'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    // overridden
    _initView: function () {
      // this._createChildControl('emojis')
      const field = this.getChildControl('textfield')
      const group = this.getCommandGroup()

      const newLine = new qx.ui.command.Command('Shift+Enter')
      newLine.addListener('execute', () => {
        const start = field.getTextSelectionStart()
        const end = field.getTextSelectionEnd()
        let parts = [field.getValue().substring(0, start), field.getValue().substring(end)]
        field.setValue(parts.join('\n'))
        field.setTextSelection(start + 1, start + 1)
      })
      group.add('newline', newLine)

      field.addListener('focusin', () => {
        group.setActive(true)
      })

      field.addListener('focusout', () => {
        group.setActive(false)
      })

      this.base(arguments)
    },

    // overridden
    _maintainCommandGroupState: function () {
    },

    _postActivity: async function () {
      await this.base(arguments)
      this.getChildControl('textfield').setEnabled(true)
      this.getChildControl('textfield').resetValue()
    },

    // overridden
    _createContent: function () {
      return {
        content: this.getChildControl('textfield').getValue()
      }
    },

    // property apply
    _applyActivity: function (value) {
      if (value) {
        this.getChildControl('textfield').setValue(value.getContent().content)
      } else {
        this.getChildControl('textfield').resetValue()
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
          control.set({
            minimalLineHeight: 1,
            autoSize: true
          })
          this._addAt(control, 1, {flex: 1})
          control.addListener('focusin', this._sendWrite, this)
          control.addListener('focusout', this._sendWriteEnd, this)
          control.addListener('input', this._sendWrite, this)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
