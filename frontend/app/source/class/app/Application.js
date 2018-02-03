/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "app"
 *
 * @asset(app/*)
 * @require(app.model.Event)
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

      // install service worker
      const workerHandler = app.io.ServiceWorkerHandler.getInstance()
      workerHandler.init(qx.util.ResourceManager.getInstance().toUri('app/sw.js'))

      /*
      -------------------------------------------------------------------------
        Init socketcluster connection
      -------------------------------------------------------------------------
      */
      this.__socket = app.io.Socket.getInstance()
      const main = new app.ui.Main()

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

    // interface method
    terminate: function () {
      this.__socket.close()
    }
  }
})
