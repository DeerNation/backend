/**
 * MHidden
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Mixin.define('app.api.MChannel', {

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.addListener('changeType', this._updateIcon, this)
    this._updateIcon()
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    hidden: {
      check: 'Boolean',
      init: false,
      event: 'changedHidden'
    },
    favorite: {
      check: 'Boolean',
      init: false
    },
    typeIcon: {
      check: 'String',
      nullable: true,
      event: 'changedTypeIcon',
      apply: '_updateIcon'
    },

    icon: {
      check: 'String',
      nullable: true,
      event: 'changedIcon'
    },

    view: {
      check: function (value) {
        return app.plugins.Registry.hasView(value)
      },
      init: 'channel'
    },

    allowedActivityTypes: {
      check: 'Array',
      nullable: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _updateIcon: function () {
      const typeIcon = this.getTypeIcon()
      if (typeIcon) {
        this.setIcon(app.Config.icons[typeIcon])
      } else {
        this.setIcon(this.getType() === proto.dn.model.Channel.Type.PRIVATE ? app.Config.icons.private : app.Config.icons.public)
      }
    },

    /**
     * Convenience method to allow channels to be used in the same list as subscriptions
     * @returns {proto.dn.model.Channel}
     */
    getChannel: function () {
      return this
    },

    /**
     * Convenience method to allow channels to be used in the same list as subscriptions
     * @returns {String}
     */
    getChannelId: function () {
      return this.getId()
    },

    /**
     * Convenience method to allow channels to be used in the same list as subscriptions
     * @returns {null}
     */
    getViewedUntil: function () {
      return null
    }
  }
})
