/**
 * Mixin for proto.dn.model.Actor
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Mixin.define('app.api.MActor', {

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    const icon = new app.ui.basic.AvatarIcon()
    this.setIcon(icon)
    this.bind('username', icon, 'title')
    this.bind('color', icon, 'backgroundColor', {
      converter: function (value) {
        return value || null
      }
    })
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    icon: {
      check: 'qx.ui.basic.Atom',
      nullable: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    isAdmin: function () {
      return this.getRole() === 'admin'
    },

    // property apply
    _applyOnline: function (value) {
      if (app.Model.getInstance().getActor() === this) {
        app.io.Socket.getInstance().emit('$INT.users', {id: this.getUid(), online: value})
      }
    }
  }
})
