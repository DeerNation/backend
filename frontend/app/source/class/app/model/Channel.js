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
 * Channel objact holding mete information about a channel
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.model.Channel', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments, props)
    if (!this.getColor()) {
      this.setColor(app.model.Channel.getRandomColor())
    }
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    getRandomColor: function () {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }
  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */
  properties: {

    type: {
      check: ['PUBLIC', 'PRIVATE'],
      init: 'PUBLIC',
      event: 'changedType',
      apply: '_updateIcon'
    },

    title: {
      check: 'String',
      init: null,
      event: 'changedTitle'
    },

    description: {
      check: 'String',
      init: null,
      event: 'changedDescription'
    },

    /**
     * Owner of the channel
     */
    ownerId: {
      check: 'String',
      init: null,
      event: 'changedOwnerId'
    },

    /**
     * Channel creation date
     */
    created: {
      check: 'Date',
      init: null,
      transform: '_transformDate',
      event: 'changedCreated'
    },

    color: {
      check: 'Color',
      init: null,
      event: 'changedColor'
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
    hidden: {
      check: 'Boolean',
      init: false
    },
    favorite: {
      check: 'Boolean',
      init: false
    },

    view: {
      check: ['channel', 'calendar'],
      init: 'channel'
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
        this.setIcon(this.getType() === 'PRIVATE' ? app.Config.icons.private : app.Config.icons.public)
      }
    },

    /**
     * Conveniance method to allow channels to be used in the same list as subscriptions
     * @returns {app.model.Channel}
     */
    getChannel: function () {
      return this
    },

    /**
     * Conveniance method to allow channels to be used in the same list as subscriptions
     * @returns {String}
     */
    getChannelId: function () {
      return this.getId()
    },

    /**
     * Conveniance method to allow channels to be used in the same list as subscriptions
     * @returns {null}
     */
    getViewedUntil: function () {
      return null
    }
  }
})
