/**
 * Then event content plugin provides the "Event" content type for activities.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @require(proto.dn.model.payload.Event)
 */

qx.Class.define('app.plugins.event.Main', {
  extend: qx.core.Object,

  defer: function () {
    // register
    app.plugins.Registry.getInstance().registerContentPlugin({
      type: 'event',
      renderer: app.plugins.event.Renderer,
      form: app.plugins.event.Form,
      channelView: app.plugins.event.Calendar,
      viewName: 'calendar',
      theme: [
        {
          target: app.theme,
          patches: {
            appearance: app.plugins.event.theme.Appearance,
            decoration: app.plugins.event.theme.Decoration
          }
        }, {
          target: app.mobile.theme,
          patches: {
            appearance: app.plugins.event.theme.mobile.Appearance
          }
        }
      ]
    })
  }
})
