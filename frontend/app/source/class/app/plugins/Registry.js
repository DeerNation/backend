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
 * Registry
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.plugins.Registry', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.__patchedThemes = {}
  },

  /*
 ******************************************************
   STATICS
 ******************************************************
 */
  statics: {
    _views: {},

    registerView: function (name, viewClazz) {
      this._views[name] = {
        Clazz: viewClazz,
        instance: null
      }
    },

    getViewInstance: function (name) {
      if (this._views.hasOwnProperty(name) && this._views[name].instance) {
        return this._views[name].instance
      }
      return null
    },

    getViewConfig: function (name) {
      if (this._views.hasOwnProperty(name)) {
        return this._views[name]
      }
      return null
    },

    hasView: function (name) {
      return this._views.hasOwnProperty(name)
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __patchedThemes: null,

    /**
     * Registers a content plugin
     * @param settings {Map} plugin settings
     */
    registerContentPlugin: function (settings) {
      this.debug('registering content plugin:', settings.type)
      app.model.activity.Registry.getInstance().register(settings.type, settings.model, settings.renderer, settings.form)
      app.plugins.Registry.registerView(settings.viewName, settings.channelView)

      // patch Theme of the plugin provides one
      if (settings.hasOwnProperty('theme') && !this.__patchedThemes[settings.type]) {
        settings.theme.forEach(themeSettings => {
          Object.keys(themeSettings.patches).forEach(key => {
            if (key === 'meta') {
              this.debug('patching meta theme', themeSettings.patches[key])
              qx.Theme.patch(themeSettings.target.Theme, themeSettings.patches[key])
            } else {
              this.debug('patching theme', themeSettings.patches[key])
              qx.Theme.patch(themeSettings.target[qx.lang.String.firstUp(key)], themeSettings.patches[key])
            }
          })
        })
        this.__patchedThemes[settings.type] = true
      }
    }
  }
})
