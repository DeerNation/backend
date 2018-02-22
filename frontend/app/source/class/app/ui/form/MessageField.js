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
    const field = this.getChildControl('textfield')
    let group = this._editCommandGroup = new qx.ui.command.Group()

    const newLine = new qx.ui.command.Command('Shift+Enter')
    const send = this.__sendCommand = new qx.ui.command.Command('Enter')
    send.addListener('execute', this.postMessage, this)
    newLine.addListener('execute', () => {
      const start = field.getTextSelectionStart()
      const end = field.getTextSelectionEnd()
      let parts = [field.getValue().substring(0, start), field.getValue().substring(end)]
      field.setValue(parts.join('\n'))
      field.setTextSelection(start + 1, start + 1)
    })
    group.add('newline', newLine)
    group.add('send', send)
    field.addListener('focusin', () => {
      group.setActive(true)
    })

    field.addListener('focusout', () => {
      group.setActive(false)
    })

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
    },

    activity: {
      check: 'app.model.Activity',
      nullable: true,
      apply: '_applyActivity'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _editCommandGroup: null,
    __sendCommand: null,

    postMessage: async function () {
      if (this.getModel()) {
        // TODO: show spinner during message sending
        this.getChildControl('textfield').setEnabled(false)
        if (this.getActivity()) {
          // update message in existing activity
          try {
            await app.io.Rpc.getProxy().updateObjectProperty('Activity',
              this.getActivity().getId(),
              {
                content: {
                  message: this.getChildControl('textfield').getValue()
                }
              })
            this.getChildControl('textfield').setEnabled(true)
            this.resetActivity()
          } catch (err) {
            this.getChildControl('textfield').setEnabled(true)
            this.error(err)
          }
        } else {
          try {
            await app.io.Rpc.getProxy().publish(this.getModel().getId(), {
              type: 'Message',
              content: {
                message: this.getChildControl('textfield').getValue()
              }
            })
            this.getChildControl('textfield').setEnabled(true)
            this.getChildControl('textfield').resetValue()
          } catch (err) {
            this.getChildControl('textfield').setEnabled(true)
            this.error(err)
          }
        }
      }
    },

    // property apply
    _applyActivity: function (value) {
      if (value) {
        this.getChildControl('textfield').setValue(value.getContent().message)
      } else {
        this.getChildControl('textfield').resetValue()
      }
    },

    _sendWrite: function () {
      app.io.Socket.getInstance().emit(this.getModel().getId(), {
        a: 'i',
        c: {
          type: 'write',
          uid: app.Model.getInstance().getActor().getId()
        }
      })
    },

    _sendWriteEnd: function () {
      app.io.Socket.getInstance().emit(this.getModel().getId(), {
        a: 'i',
        c: {
          type: 'write',
          uid: app.Model.getInstance().getActor().getId(),
          done: true
        }
      })
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

        case 'send-button':
          control = new qx.ui.form.Button(null, app.Config.icons.plus + '/20', this.__sendCommand)
          this._addAt(control, 2)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
