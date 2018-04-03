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
 * Activity
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.model.activity.content.AbstractActivityContent', {
  extend: qx.core.Object,
  type: 'abstract',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments)
    this.set(props)
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _transformDate: function (value) {
      if (qx.lang.Type.isString(value)) {
        return new Date(value)
      }
      return value
    }
  }
})
