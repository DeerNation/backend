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
 * Suscriptions list for current actor
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.ui.list.Subscriptions', {
  extend: qx.ui.list.List,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (model, delegateOverride) {
    this.base(arguments, model)
    this.__initDelegate(delegateOverride)
    qx.event.message.Bus.subscribe('menu.subscription.update', this.refresh, this)
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __initDelegate: function (override) {
      this.setDelegate(Object.assign(this._createDefaultDelegate(), override || {}))
    },

    _createDefaultDelegate: function () {
      return {
        createItem: function () {
          return new app.ui.form.SubscriptionItem()
        },

        bindItem: function (controller, item, index) {
          controller.bindProperty('', 'model', null, item, index)
        },

        group: function (subscription) {
          if (subscription.isFavorite()) {
            return qx.locale.Manager.tr('Favorites')
          }
          switch (subscription.getChannel().getType()) {
            case proto.dn.model.Channel.Type.PUBLIC:
              return qx.locale.Manager.tr('Channels')

            case proto.dn.Channel.Type.PRIVATE:
              return qx.locale.Manager.tr('Private channels')
          }
        },

        configureGroupItem: function (item) {
          item.setAppearance('channel-group-item')
        },

        filter: function (model) {
          return !model.isHidden()
        },

        sorter: function (a, b) {
          if (a.isFavorite()) {
            if (b.isFavorite()) {
              return a.getChannel().getTitle().localeCompare(b.getChannel().getTitle())
            } else {
              return -1
            }
          } else if (b.isFavorite()) {
            return 1
          } else if (a.getChannel().getType() === proto.dn.model.Channel.Type.PUBLIC) {
            if (b.getChannel().getType() === proto.dn.model.Channel.Type.PUBLIC) {
              return a.getChannel().getTitle().localeCompare(b.getChannel().getTitle())
            } else {
              return -1
            }
          } else {
            return 1
          }
        }
      }
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    qx.event.message.Bus.unsubscribe('menu.subscription.update', this.refresh, this)
  }
})
