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
qx.Class.define("app.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __activities: null,
    __socket: null,
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Init socketcluster connection
      -------------------------------------------------------------------------
      */
      this.__socket = app.io.Socket.getInstance()

      this.__activities = new qx.data.Array();

      let list = new qx.ui.list.List(this.__activities);
      list.setLabelPath("title");

      // RPC test
      this.debug(this.__socket.toHashCode(), this.__socket.isAuthenticated())
      if (this.__socket.isAuthenticated()) {
        app.io.Rpc.send('getChannels').then(this._initSubscriptions.bind(this)).catch(this.error.bind(this))
      } else {
        const lid = this.__socket.addListener("changeAuthenticated", function(ev) {
          if (ev.getData() === true) {
            app.io.Rpc.send('getChannels').then(this._initSubscriptions.bind(this)).catch(this.error.bind(this))
            this.__socket.removeListenerById(lid)
          }
        }, this)
      }

      // Document is the application root
      let doc = this.getRoot();
      doc.add(list, {edge: 0})
    },

    _initSubscriptions: function(channels) {
      channels.forEach(channelEntry => {
        this.__socket.subscribe(channelEntry.name).then(sampleChannel => {
          console.log(channelEntry.name, "subscribed")

          sampleChannel.on('subscribeFail', function (err) {
            console.log('Failed to subscribe to the '+channelEntry.name+' channel due to error: ' + err);
          });

          sampleChannel.watch(payload => {
            if (!qx.lang.Type.isArray(payload)) {
              payload = [payload]
            }
            payload.forEach(data => {
              let clazz = null
              if (data.hasOwnProperty('__jsonclass__')) {
                clazz = qx.Class.getByName(data['__jsonclass__'])
                if (!clazz) {
                  throw Error("Class "+clazz+" not found")
                }
                delete data['__jsonclass__']
              }
              if (!clazz) {
                clazz = app.model.Activity
              }
              let activity = new clazz(data)
              this.__activities.push(activity)
            })
          });
        });
      });
    }
  }
});
