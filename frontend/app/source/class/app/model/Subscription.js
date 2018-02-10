/**
 * Subscription
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.model.Subscription', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {

    actorId: {
      check: 'String',
      init: null,
      event: 'changedActorId'
    },
    channelId: {
      check: 'String',
      init: null,
      apply: '_applyChannelId',
      event: 'changedChannelId'
    },
    viewedUntil: {
      check: 'Date',
      nullable: true,
      transform: '_transformDate',
      event: 'changedViewedUntil'
    },
    desktopNotification: {
      check: 'Object',
      nullable: true,
      event: 'changedDesktopNotification'
    },
    mobileNotification: {
      check: 'Object',
      nullable: true,
      event: 'changedMobileNotification'
    },
    emailNotification: {
      check: 'Object',
      nullable: true,
      event: 'changedEmailNotification'
    },

    favorite: {
      check: 'Boolean',
      init: false,
      event: 'changedFavorite',
      apply: '_persistProperty'
    },

    channel: {
      check: 'app.model.Channel',
      init: null,
      event: 'changedChannel',
      apply: '_updateIcon'
    },

    icon: {
      check: 'String',
      nullable: true,
      event: 'changedIcon'
    },

    hidden: {
      check: 'Boolean',
      init: false,
      event: 'changedHidden'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    // property apply, overridden
    _persistProperty: function (value, old, name) {
      this.base(arguments, value, old, name)
      qx.event.message.Bus.dispatchByName('menu.subscription.update', true)
    },

    // property apply
    _updateIcon: function () {
      if (this.getChannel().getTypeIcon()) {
        this.setIcon(app.Config.icons[this.getChannel().getTypeIcon()])
      } else {
        this.setIcon(this.getChannel().getType() === 'PRIVATE' ? app.Config.icons.private : app.Config.icons.public)
      }
    },

    // property apply
    _applyChannelId: function (value) {
      let channel = app.Model.lookup('channel', value)
      if (channel) {
        this.setChannel(channel)
      } else {
        app.Model.asyncLookup('channel', value).then(channel => {
          this.setChannel(channel)
        })
      }
    },

    /**
     * Delete this subscription
     */
    delete: function () {

    }
  }
})
