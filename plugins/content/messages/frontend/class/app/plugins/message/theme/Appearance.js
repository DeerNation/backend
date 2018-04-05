qx.Theme.define('app.plugins.message.theme.Appearance', {
  appearances: {
    /*
    ---------------------------------------------------------------------------
      Acivity type 'message'
    ---------------------------------------------------------------------------
    */
    'message-activity': {},
    'message-activity/title': {
      include: 'label',
      alias: 'label',
      style: function (states) {
        return {
          textColor: states.link ? 'link-color' : 'inherit',
          cursor: states.link ? 'pointer' : 'default'
        }
      }
    },
    'message-activity/message': 'message-activity/title',

    /*
    ---------------------------------------------------------------------------
     ACTIVITY EDITOR
    ---------------------------------------------------------------------------
    */
    'message-editor/textfield': {
      style: function () {
        return {
          decorator: 'form-field',
          margin: 4,
          padding: 10,
          font: 'message',
          maxHeight: 100
        }
      }
    }
  }
})
