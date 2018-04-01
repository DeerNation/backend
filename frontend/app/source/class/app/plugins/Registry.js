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
