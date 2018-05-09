/**
 * MUpdate mixin for self maintaining objects
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Mixin.define('app.api.MUpdate', {
  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    if (this.getUid) {
      if (!this.getUid()) {
        this.addListenerOnce('changeUid', this.__init, this)
      } else {
        this.__init()
      }
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __init: function () {
      qx.event.message.Bus.subscribe('proto.dn.model.' + this.getUid(), this._onUpdate, this)
    },

    _onUpdate: function (ev) {
      const change = ev.getData()
      switch (change.getType()) {
        case proto.dn.ChangeType.DELETE:
          console.log('disposing ' + this.getUid() + '/' + change.getOneOfContent().getUid())
          this.dispose()
          break

        case proto.dn.ChangeType.UPDATE:
        case proto.dn.ChangeType.REPLACE:
          const changes = qx.util.Serializer.toNativeObject(change.getOneOfContent(), app.api.Utils.serialize)
          console.log(changes, change.getResetProperties())
          if (changes.length > 1) {
            this.set(changes)
          }
          change.getResetProperties().forEach(this.reset, this)
          break
      }
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    qx.event.message.Bus.unsubscribe('proto.dn.model.' + this.getUid(), this._onUpdate, this)
  }
})
