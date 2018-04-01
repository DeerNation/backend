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

    'channel-view/list': {
      include: 'list',
      alias: 'list',

      style: function () {
        return {
          decorator: null,
          backgroundColor: 'transparent'
        }
      }
    },

    'channel-view/status-bar': {
      style: function () {
        return {
          padding: [0, 10]
        }
      }
    },

    'channel-view/header': {
      style: function () {
        return {
          minHeight: 50,
          padding: [0, 20],
          backgroundColor: 'rgba(47, 52, 61, 0.2)'
        }
      }
    },

    'channel-view/header/title': {
      style: function () {
        return {
          margin: 8,
          gap: 4
        }
      }
    },

    'channel-view/header/title/label': {
      style: function () {
        return {
          font: 'channel'
        }
      }
    },

    'channel-view/header/title/icon': {
      style: function () {
        return {
          textColor: 'lightgrey'
        }
      }
    },

    'channel-view/header/favorite': {
      style: function (states) {
        return {
          textColor: states.enabled ? 'favorite' : 'lightgrey',
          height: 50,
          center: true
        }
      }
    },

    'channel-view/header/description': {
      style: function () {
        return {
          textColor: 'lightgrey',
          margin: 8
        }
      }
    },

    'channel-view/context-bar': 'channel-view/header',
    'channel-view/back-button': 'app-toolbar-button',
    'channel-view/delete-button': 'app-toolbar-button',
    'channel-view/share-button': 'app-toolbar-button',
    'channel-view/selection-counter': {
      include: 'atom',
      alias: 'atom',

      style: function () {
        return {
          font: 'sidebar-actor-icon',
          center: true,
          width: 50,
          height: 50
        }
      }
    },

    'channel-view/login-hint': {
      style: function () {
        return {
          padding: [0, 10],
          textAlign: 'center'
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
     ACTIVITY EDITOR
    ---------------------------------------------------------------------------
    */
    'channel-view/message-field/textfield': {
      style: function () {
        return {
          decorator: 'form-field',
          margin: 4,
          padding: 10,
          font: 'message'
        }
      }
    }
  }
})
