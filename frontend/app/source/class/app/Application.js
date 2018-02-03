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
qx.Class.define('app.Application',
  {
    extend: qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

    members:
    {
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
          qx.log.appender.Native
        // support additional cross-browser console. Press F7 to toggle visibility
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

        this.__activities = new qx.data.Array()

        const dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat('long'))

        let list = new qx.ui.list.List(this.__activities)
        console.log(list)

        const deferredScroll = qx.util.Function.debounce(() => {
          list.scrollToY(1e99)
        }, 100)
        this.__activities.addListener('changeLength', deferredScroll, this)
        list.setVariableItemHeight(true)
        list.setDelegate({
          createItem: function () {
            return new app.ui.form.ActivityItem()
          },

          bindItem: function (controller, item, index) {
            controller.bindProperty('', 'model', null, item, index)
            controller.bindProperty('title', 'message', null, item, index)
          },

          group: function (model) {
            const date = model.getPublished() || model.getCreated()
            return date ? dateFormat.format(date) : null
          },

          sorter: function (a, b) {
            const adate = a.getPublished() || a.getCreated()
            const bdate = b.getPublished() || b.getCreated()
            return adate.getTime() - bdate.getTime()
          }
        })

      // RPC test
        this.debug(this.__socket.toHashCode(), this.__socket.isAuthenticated())
        if (this.__socket.isAuthenticated()) {
          app.io.Rpc.getProxy().getChannels().then(this._initSubscriptions.bind(this)).catch(this.error.bind(this))
        } else {
          const lid = this.__socket.addListener('changeAuthenticated', function (ev) {
            if (ev.getData() === true) {
              app.io.Rpc.getProxy().getChannels().then(this._initSubscriptions.bind(this)).catch(this.error.bind(this))
              this.__socket.removeListenerById(lid)
            }
          }, this)
        }

      // Document is the application root
        let doc = this.getRoot()
        doc.add(list, {edge: 0})
      },

    // interface method
      terminate: function () {
        this.__socket.close()
      },

      _initSubscriptions: function (channels) {
        channels.forEach(channelEntry => {
          this.__socket.subscribe(channelEntry.channelId).then(sampleChannel => {
          // get all channel messages

            app.io.Rpc.getProxy().getChannelActivities(channelEntry.channelId, channelEntry.viewedUntil).then(messages => {
              this.__activities.append(app.model.Factory.createAll(messages))
            })

            this.info(channelEntry.channelId, 'subscribed')

            sampleChannel.on('subscribeFail', err => {
              this.error('Failed to subscribe to the ' + channelEntry.channelId + ' channel due to error: ' + err)
            })

            sampleChannel.watch(payload => {
              if (!qx.lang.Type.isArray(payload)) {
                payload = [payload]
              }
              payload.forEach(data => {
                this.__activities.push(app.model.Factory.create(data))
              })
            })
          })
        })
      }
    }
  })
