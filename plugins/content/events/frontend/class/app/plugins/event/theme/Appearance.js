qx.Theme.define('app.plugins.event.theme.Appearance', {
  appearances: {
    'calendar-view/popup': {
      include: 'popup',
      alias: 'popup',
      style: function () {
        return {
          padding: 10
        }
      }
    },
    'calendar-view/renderer': 'event-activity',
    'calendar-view/renderer/toolbar': 'toolbar',
    'calendar-view/renderer/button-share': 'app-toolbar-button',
    'calendar-view/renderer/button-edit': 'app-toolbar-button',
    'calendar-view/renderer/button-delete': 'app-toolbar-button',

    'calendar-view/header': 'channel-view/header',
    'calendar-view/status-bar': 'channel-view/status-bar',
    'calendar-view/calendar-container': {
      style: function () {
        return {
          margin: 10
        }
      }
    },

    /*
     ---------------------------------------------------------------------------
       Activity type 'event'
     ---------------------------------------------------------------------------
    */
    'event-activity': {
      style: function () {
        return {
          paddingTop: 8
        }
      }
    },

    'event-activity/date-sheet': {
      style: function () {
        return {
          decorator: 'date-sheet',
          // backgroundColor: 'event-default-bg',
          // textColor: 'white',
          padding: 4,
          marginRight: 10,
          allowGrowY: false
        }
      }
    },
    'event-activity/day': {
      style: function () {
        return {
          font: 'event-day'
        }
      }
    },
    'event-activity/year': {
      style: function () {
        return {
          font: 'default'
        }
      }
    },
    'event-activity/time': {
      style: function () {
        return {
          font: 'time-font'
        }
      }
    },
    'event-activity/title': {
      include: 'label',
      alias: 'label',

      style: function () {
        return {
          font: 'activity-title'
        }
      }
    },
    'event-activity/description': 'label',

    'event-activity/categories': {
      style: function () {
        return {
          margin: [8, 0]
        }
      }
    },

    'category': {
      style: function () {
        return {
          decorator: 'category',
          padding: [4, 8],
          textColor: 'info-font'
        }
      }
    }
  }
})
