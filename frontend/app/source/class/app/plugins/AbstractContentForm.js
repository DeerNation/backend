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
    this.setCommandGroup(new qx.ui.command.Group())
    this._initView()
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    channel: {
      check: 'proto.dn.model.Channel',
      nullable: true,
      event: 'changeChannel',
      dereference: true
    },

    activity: {
      check: 'proto.dn.model.Activity',
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
    },

    commandGroup: {
      check: 'qx.ui.command.Group',
      nullable: true,
      apply: '_applyCommandGroup'
    }
  },

  /*
  ******************************************************
    EVENTS
  ******************************************************
  */
  events: {
    'done': 'qx.event.type.Event'
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _editCommandGroup: null,
    __sendCommand: null,

    /**
     * Initialize the widgets
     * @protected
     */
    _initView: function () {
      this._createChildControl('send-button')
    },

    // property apply
    _applyCommandGroup: function (value, old) {
      if (old && !value) {
        this.removeListener('disappear', this._maintainCommandGroupState, this)
        this.removeListener('appear', this._maintainCommandGroupState, this)
      }

      if (value) {
        this.addListener('disappear', this._maintainCommandGroupState, this)
        this.addListener('appear', this._maintainCommandGroupState, this)
      }
    },

    _maintainCommandGroupState: function () {
      this.getCommandGroup().setActive(this.isVisible())
    },

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
            const newAct = new proto.dn.model.Activity({uid: this.getActivity().getUid()})
            newAct.set(this.getType(), this._createContent())
            await app.api.Service.getInstance().updateObject(new proto.dn.Object({
              activity: newAct
            }))
            this.resetActivity()
            this.fireEvent('done')
          } catch (err) {
            this.error(err)
          }
        } else {
          const newAct = new proto.dn.model.Activity()
          newAct.set(this.getType(), this._createContent())
          const newObj = new proto.dn.Object({
            publication: new proto.dn.model.Publication({
              activity: newAct,
              channel: new proto.dn.model.Channel({uid: this.getChannel().getUid()})
            })
          })
          const response = await app.api.Service.getInstance().createObject(newObj)
          if (response.getCode() !== proto.dn.Response.Code.OK) {
            app.Error.show(response.getMessage())
          }
          this.fireEvent('done')
        }
      } else {
        this.fireEvent('done')
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
        const message = app.api.Service.createChannelModel(new proto.dn.WritingUser({
          done: false,
          username: app.Model.getInstance().getActor().getUsername()
        }), proto.dn.ChangeType.INTERNAL)
        app.io.Socket.getInstance().publishPb(this.getChannel().getId(), message)
      }
    },

    /**
     * Send notification that the user has stopped writing in this channel.
     * @proteced
     */
    _sendWriteEnd: function () {
      if (this.getChannel()) {
        const message = app.api.Service.createChannelModel(new proto.dn.WritingUser({
          done: true,
          username: app.Model.getInstance().getActor().getUsername()
        }), proto.dn.ChangeType.INTERNAL)
        app.io.Socket.getInstance().publishPb(this.getChannel().getId(), message)
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'send-button':
          const command = new qx.ui.command.Command('Enter')
          this.getCommandGroup().add('send', command)
          control = new qx.ui.form.Button(null, app.Config.icons.plus + '/20', command)
          control.addListener('execute', this._postActivity, this)
          this._add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
