/**
 * qx.data.Array with automatic handling of updates from backend (e.g. deleted objects are automatically removed from the array)
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.api.Array', {
  extend: qx.data.Array,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.addListener('change', this.__onChange, this)
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __onChange: function (ev) {
      ev.getData().added.forEach(entry => {
        if (entry instanceof proto.core.BaseMessage) {
          qx.event.message.Bus.subscribe('proto.dn.model.' + entry, this._onObjectUpdate, this)
        }
      })
      ev.getData().removed.forEach(entry => {
        if (entry instanceof proto.core.BaseMessage) {
          qx.event.message.Bus.unsubscribe('proto.dn.model.' + entry, this._onObjectUpdate, this)
        }
      })
    },

    _onObjectUpdate: function (ev) {
      const change = ev.getData()
      if (change.getType() === proto.dn.ChangeType.DELETE) {
        const uid = change.getContent().getUid()
        this.some(entry => {
          if (entry.getUid && entry.getUid() === uid) {
            this.remove(entry)
            return true
          }
        })
      }
    }
  }
})
