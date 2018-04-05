/**
 * Abstract base class for all activity content form classes.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.plugins.AbstractContentForm', {
  extend: qx.ui.core.Widget,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    channel: {
      check: 'app.model.Channel',
      nullable: true,
      event: 'changeChannel',
      dereference: true
    },

    activity: {
      check: 'app.model.Activity',
      nullable: true,
      apply: '_applyActivity',
      dereference: true
    },

    /**
     * Activity type this class can handle
     */
    type: {
      check: 'String',
      init: 'Message'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    /**
     * Sends the currently edited activity to the backend.
     * @protected
     */
    _postActivity: async function () {
      if (this.getChannel()) {
        // TODO: show spinner during message sending
        if (this.getActivity()) {
          // update message in existing activity
          try {
            await app.io.Rpc.getProxy().updateObjectProperty('Activity',
              this.getActivity().getId(),
              {
                content: this._createContent()
              })
            this.getChildControl('textfield').setEnabled(true)
            this.resetActivity()
          } catch (err) {
            this.getChildControl('textfield').setEnabled(true)
            this.error(err)
          }
        } else {
          return app.io.Rpc.getProxy().publish(this.getModel().getId(), {
            type: this.getType(),
            content: this._createContent()
          })
        }
      }
    },

    /**
     * Creates a content object with the current field values.
     * This method must be overridden by inheriting sub classes.
     * @return {Map} plain content object ready to be send to the backend.
     * @protected
     */
    _createContent: function () {
      throw new Error('unimplemented')
    },

    // property apply
    _applyActivity: function (value) {},

    /**
     * Send notification that the user is currently writing in this channel.
     * @proteced
     */
    _sendWrite: function () {
      if (this.getChannel()) {
        app.io.Socket.getInstance().publish(this.getChannel().getId(), {
          a: 'i',
          c: {
            type: 'write',
            uid: app.Model.getInstance().getActor().getUsername()
          }
        })
      }
    },

    /**
     * Send notification that the user has stopped writing in this channel.
     * @proteced
     */
    _sendWriteEnd: function () {
      if (this.getChannel()) {
        app.io.Socket.getInstance().publish(this.getChannel().getId(), {
          a: 'i',
          c: {
            type: 'write',
            uid: app.Model.getInstance().getActor().getUsername(),
            done: true
          }
        })
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'send-button':
          control = new qx.ui.form.Button(null, app.Config.icons.plus + '/20')
          control.addListener('execute', this._postActivity, this)
          this._add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
