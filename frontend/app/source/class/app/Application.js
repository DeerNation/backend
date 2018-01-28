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


      const socket = app.io.Socket.getInstance()

      let activities = new qx.data.Array();

      let list = new qx.ui.list.List(activities);
      list.setLabelPath("title");

      socket.subscribe('hbg.channel.news').then((sampleChannel)=> {

        sampleChannel.on('subscribeFail', function (err) {
          console.log('Failed to subscribe to the Hirschberg News channel due to error: ' + err);
        });

        sampleChannel.watch(function (payload) {
          if (!qx.lang.Type.isArray(payload)) {
            payload = [payload]
          }
          payload.forEach((data) => {
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
            activities.push(activity)
          })
        });

        socket.emit('hbg.rpc.getNews');

      });

      // Document is the application root
      let doc = this.getRoot();
      doc.add(list, {edge: 0})
    }
  }
});
