/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "app"
 *
 * @asset(app/*)
 * @asset(font/*)
 * @require(app.ui.Main)
 * @require(app.mobile.ui.Main)
 */
qx.Class.define('app.Application', {
  extend: qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __activities: null,
    __socket: null,
    __main: null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main: function () {
      // Call super class
      this.base(arguments)

      // Enable logging in debug variant
      if (qx.core.Environment.get('qx.debug')) {
        // support native logging capabilities, e.g. Firebug for Firefox
        // eslint-disable-next-line
        qx.log.appender.Native
        // support additional cross-browser console. Press F7 to toggle visibility
        // eslint-disable-next-line
        qx.log.appender.Console
      }

      if (qx.core.Environment.get('app.cordova')) {
        const loader = new qx.util.DynamicScriptLoader(['../../cordova.js'])
        loader.addListenerOnce('ready', () => {
          console.log('all scripts have been loaded!')
        })
        document.addEventListener('deviceready', this.__init.bind(this), false)

        loader.addListener('failed', function (e) {
          const data = e.getData()
          console.log('failed to load ' + data.script)
        })

        loader.start()
      } else {
        this.__init()
      }
    },

    __init: function () {
      app.Config.init()

      // install service worker (not working in app context)
      if (qx.core.Environment.get('app.cordova')) {
        // use push plugin
        app.io.PushPlugin.getInstance().init()
      } else {
        // use service worker
        const workerHandler = app.io.ServiceWorkerHandler.getInstance()
        workerHandler.init(qx.util.ResourceManager.getInstance().toUri('app/sw.js'))

        app.io.Firebase.getInstance().init()
      }

      if (app.Config.target === 'mobile') {
        qx.theme.manager.Meta.getInstance().setTheme(app.mobile.theme.Theme)
      }
      /*
     -------------------------------------------------------------------------
       Init socketcluster connection
     -------------------------------------------------------------------------
     */
      this.__socket = app.io.Socket.getInstance()
      const main = this.__main = new (app.Config.getTargetClass('app.ui.Main'))()

      // RPC test
      if (this.__socket.isAuthenticated()) {
        app.Model.getInstance().init()
      } else {
        const lid = this.__socket.addListener('changeAuthenticated', function (ev) {
          if (ev.getData() === true) {
            app.Model.getInstance().init()
            this.__socket.removeListenerById(lid)
          }
        }, this)
      }

      // Document is the application root
      let doc = this.getRoot()

      doc.add(main, {edge: 0})
    },

    getMain: function () {
      return this.__main
    },

    // interface method
    terminate: function () {
      this.__socket.close()
      this.__main.dispose()
    }
  }
})
