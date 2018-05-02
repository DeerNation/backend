/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * Subscription
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @deprecated
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
      this.setIcon(this.getChannel().getIcon())
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
