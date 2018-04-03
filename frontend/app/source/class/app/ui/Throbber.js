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
 * Loading indicator that shows a spinning refresh icon.
 */
qx.Class.define('app.ui.Throbber', {
  extend: qx.ui.basic.Atom,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (icon) {
    this.base(arguments, null, icon || app.Config.icons.refresh)

    this.addListener('appear', this.startAnimation, this)
    this.addListener('disappear', this.stopAnimation, this)
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics: {
    animate: function (iconWidget, icon) {
      qx.core.Assert.assertInstance(iconWidget, qx.ui.basic.Image)

      if (icon) {
        iconWidget.setUserData('oldIcon', iconWidget.getSource())
        iconWidget.setSource(icon)
      }
      return qx.bom.element.Animation.animate(iconWidget.getContentElement().getDomElement(), {
        'duration': 1000,
        'keep': 100,
        'keyFrames': {
          0: {'transform': 'rotate(0deg)'},
          100: {'transform': 'rotate(359deg)'}
        },
        'origin': '50% 50%',
        'repeat': 'infinite',
        'timing': 'linear',
        'alternate': false
      })
    },

    stopAnimation: function (iconWidget, handle, stop) {
      qx.core.Assert.assertInstance(iconWidget, qx.ui.basic.Image)
      if (stop) {
        handle.stop()
      } else {
        handle.pause()
      }
      if (iconWidget.getUserData('oldIcon')) {
        iconWidget.setSource(iconWidget.getUserData('oldIcon'))
        iconWidget.setUserData('oldIcon', null)
      }
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'throbber'
    },

    size: {
      check: 'Number',
      init: 40,
      themeable: true,
      apply: '_applySize'
    },

    center: {
      refine: true,
      init: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __handle: null,

    // property apply
    _applySize: function (value) {
      this.getChildControl('icon').set({
        width: value,
        height: value,
        scale: true
      })
    },

    /**
     * Start the spinner animation, this method is called automatically when the {app.ui.Throbber} receives the 'appear' event.
     */
    startAnimation: function () {
      if (!this.getBounds()) {
        this.addListenerOnce('appear', this.startAnimation, this)
        return
      }
      if (!this.__handle || this.__handle.isEnded()) {
        this.__handle = qx.bom.element.Animation.animate(this.getChildControl('icon').getContentElement().getDomElement(), {
          'duration': 1000,
          'keep': 100,
          'keyFrames': {
            0: {'transform': 'rotate(0deg)'},
            100: {'transform': 'rotate(359deg)'}
          },
          'origin': '50% 50%',
          'repeat': 'infinite',
          'timing': 'linear',
          'alternate': false
        })
      } else {
        this.__handle.play()
      }
    },

    /**
     * Stop the spinner animation, this method is called automatically when the {app.ui.Throbber} receives the 'disppear' event.
     */
    stopAnimation: function () {
      if (this.__handle) {
        this.__handle.pause()
      }
    }

  }
})
