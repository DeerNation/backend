/**
 * Then message content plugin provides the "Message" content type for activities.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.plugins.message.Main', {
  extend: qx.core.Object,

  defer: function () {
    // register
    app.plugins.Registry.getInstance().registerContentPlugin({
      type: 'message',
      model: app.plugins.message.Model,
      renderer: app.plugins.message.Renderer,
      form: app.plugins.message.MessageField,
      channelView: app.plugins.message.ChannelView,
      viewName: 'channel',
      theme: [
        {
          target: app.theme,
          patches: {
            appearance: app.plugins.message.theme.Appearance,
            decoration: app.plugins.message.theme.Decoration
          }
        }, {
          target: app.mobile.theme,
          patches: {
            appearance: app.plugins.message.theme.mobile.Appearance
          }
        }
      ]
    })
  }
})
