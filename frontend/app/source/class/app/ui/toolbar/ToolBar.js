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
 * Toolbar
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.ui.toolbar.ToolBar', {
  extend: qx.ui.toolbar.ToolBar,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (orientation) {
    this.base(arguments)
    if (orientation) {
      this.setOrientation(orientation)
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    orientation: {
      check: ['vertical', 'horizontal'],
      init: 'horizontal',
      apply: '_applyOrientation'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyOrientation: function (value) {
      switch (value) {
        case 'horizontal':
          this._setLayout(new qx.ui.layout.HBox(0, 'center'))
          this._getLayout().setAlignY('middle')
          break
        case 'vertical':
          this._setLayout(new qx.ui.layout.VBox())
          this._getLayout().setAlignX('center')
          break
      }
    },

    // overridden
    _applyShow: function(value) {
      const children = this._getChildren()
      for (let i = 0, l = children.length; i < l; i++) {
        console.log(children)
        if (children[i].setShow && !children[i].getUserData('showOverride')) {
          children[i].setShow(value)
        }
      }
    },

    /**
     * Add a widget to the toolbar if the current target matches {@see app.Config.target}
     * @param child {qx.ui.core.Widget}
     * @param child {LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     * @param targets {Array} only add the widget if one of this targets is set
     */
    addForTarget: function (child, options, targets) {
      if (!targets || targets.includes(app.Config.target)) {
        this.add(child, options)
      }
    }
  }
})
