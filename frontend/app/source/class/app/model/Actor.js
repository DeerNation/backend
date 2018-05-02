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
 * Actor model class
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @deprecated
 */

qx.Class.define('app.model.Actor', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments, props)

    const icon = new app.ui.basic.AvatarIcon()
    this.setIcon(icon)
    this.bind('username', icon, 'title')
    this.bind('color', icon, 'backgroundColor')
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {

    name: {
      check: 'String',
      init: '',
      event: 'changedName'
    },
    type: {
      check: ['Person', 'Server', 'Bot'],
      init: 'Person'
    },
    role: {
      check: 'String',
      nullable: true,
      event: 'changedRole'
    },
    desc: {
      check: 'String',
      nullable: true
    },
    email: {
      check: 'String',
      nullable: true,
      validate: qx.util.Validate.email()
    },
    username: {
      check: 'String',
      init: null,
      event: 'changedUsername'
    },
    password: {
      check: 'String',
      init: null
    },
    defaultNotification: {
      check: 'Object',
      nullable: true
    },
    online: {
      check: 'Boolean',
      init: false,
      event: 'changedOnline',
      apply: '_applyOnline'
    },
    status: {
      check: 'String',
      init: 'online',
      event: 'changedStatus',
      apply: '_persistProperty'
    },

    color: {
      check: 'Color',
      init: null,
      event: 'changedColor'
    },

    icon: {
      check: 'qx.ui.basic.Atom',
      nullable: true
    },

    locale: {
      check: 'String',
      init: null
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
        app.io.Socket.getInstance().emit('$INT.users', {id: this.getId(), online: value})
      }
    },

    // property apply, overridden
    _persistProperty: function (value, old, name) {
      if (app.Model.getInstance().getActor() === this) {
        this.base(arguments, value, old, name)
      }
    }
  }
})
