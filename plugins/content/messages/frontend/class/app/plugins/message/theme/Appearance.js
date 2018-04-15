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
          textColor: states.link ? 'link-color' : 'black',
          cursor: states.link ? 'pointer' : 'default',
          font: 'activity-title'
        }
      }
    },
    'message-activity/message': {
      include: 'message-activity/title',

      style: function () {
        return {
          font: 'message'
        }
      }
    },

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
