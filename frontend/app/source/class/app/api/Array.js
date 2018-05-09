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
    this.addListener('change', this.__onChange, this)
    this.base(arguments)
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
          console.log('listening to ' + entry.getUid())
          qx.event.message.Bus.subscribe('proto.dn.model.' + entry.getUid(), this._onObjectUpdate, this)
        }
      })
      ev.getData().removed.forEach(entry => {
        if (entry instanceof proto.core.BaseMessage) {
          console.log('stop listening to ' + entry.getUid())
          qx.event.message.Bus.unsubscribe('proto.dn.model.' + entry.getUid(), this._onObjectUpdate, this)
        }
      })
    },

    _onObjectUpdate: function (ev) {
      const change = ev.getData()
      if (change.getType() === proto.dn.ChangeType.DELETE) {
        const uid = change.getOneOfContent().getUid()
        this.some(entry => {
          if (entry.getUid && entry.getUid() === uid) {
            console.log('deleting ' + uid)
            this.remove(entry)
            return true
          }
        })
      }
    }
  }
})
