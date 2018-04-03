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
 * ActivityActor
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.form.ActivityActor', {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IModel],

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    published: {
      check: 'Date',
      init: null,
      apply: '_applyPublished'
    },

    author: {
      check: 'app.model.Actor',
      init: null,
      apply: '_applyAuthor'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'author-icon':
          control = new app.ui.basic.AvatarIcon()
          control.setAnonymous(true)
          this._add(control, {row: 0, column: 0, rowSpan: 2})
          break

        case 'header':
          const layout = new qx.ui.layout.HBox()
          layout.setAlignY('middle')
          control = new qx.ui.container.Composite(layout)
          this._add(control, {row: 0, column: 1})
          break

        case 'authorName':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this.getChildControl('header').addAt(control, 1)
          break

        case 'authorRoles':
          control = new qx.ui.form.List(true)
          control.set({
            height: null,
            width: null,
            minHeight: null,
            minWidth: null,
            anonymous: true
          })
          this._roleController = new qx.data.controller.List(this.getAuthorRoles(), control, '')
          this._roleController.setDelegate({
            configureItem: function (item) {
              item.setAppearance('authorRole-listitem')
            }
          })
          this.getChildControl('header').addAt(control, 3)
          break

        case 'authorUsername':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this.getChildControl('header').addAt(control, 2)
          break

        case 'published':
          control = new qx.ui.basic.Label(this.__dateFormat.format(this.getPublished()))
          control.setAnonymous(true)
          this.getChildControl('header').addAt(control, 4)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
