qx.Theme.define('app.plugins.message.theme.mobile.Appearance', {
  appearances: {
    'channel-view/header': {
      style: function () {
        return {
          height: 50,
          padding: 0,
          backgroundColor: 'menu-background',
          marginBottom: 8,
          textColor: 'menu-text'
        }
      }
    },

    'channel-view/header/title': {
      style: function () {
        return {
          margin: 0,
          padding: [4, 10, 0, 10],
          allowGrowY: false,
          gap: 4,
          center: true
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
    'channel-view/header/description': {
      style: function () {
        return {
          margin: 0
        }
      }
    },

    'channel-view/header/back-button': {
      style: function (states) {
        let dec = 'flat-button-h'
        if (states.first) {
          dec += '-first'
        } else if (states.last) {
          dec += '-last'
        }
        return {
          backgroundColor: states.pressed ? 'lightgrey' : 'transparent',
          decorator: dec,
          height: 50,
          width: 50,
          center: true
        }
      }
    },

    'channel-view/back-button': 'channel-view/header/back-button',
    'channel-view/delete-button': 'channel-view/header/back-button',
    'channel-view/share-button': 'channel-view/header/back-button',

    'channel-view/header/more-button': 'channel-view/header/back-button',
    'channel-view/header/favorite': {
      include: 'channel-view/header/back-button',
      alias: 'channel-view/header/back-button',

      style: function (states) {
        return {
          textColor: states.enabled ? 'favorite' : 'lightgrey'
        }
      }
    }
  }
})
