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
    id: {
      check: 'String',
      init: null,
      event: 'changedId'
    },
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
      init: false
    },

    channel: {
      check: 'app.model.Channel',
      init: null,
      event: 'changedChannel'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

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
    }
  }
})
