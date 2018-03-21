/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.theme.Appearance',
  {
    extend: qx.theme.indigo.Appearance,

    appearances:
    {
      'listitem': {
        style: function (states) {
          let padding = [3, 5, 3, 5]
          if (states.lead) {
            padding = [2, 4, 2, 4]
          }
          if (states.dragover) {
            padding[2] -= 2
          }

          let backgroundColor
          if (states.selected) {
            backgroundColor = 'background-selected'
            if (states.disabled) {
              backgroundColor += '-disabled'
            }
          }
          return {
            padding: padding,
            backgroundColor: backgroundColor,
            textColor: states.selected ? 'text-selected' : undefined,
            decorator: states.lead ? 'lead-item' : states.dragover ? 'dragover' : undefined,
            opacity: states.drag ? 0.5 : undefined
          }
        }
      },
      'avatar-icon': {
        style: function () {
          return {
            textColor: 'white',
            decorator: 'actor-icon',
            center: true
          }
        }
      },
      'app-toolbar-button': {
        include: 'toolbar-button',
        alias: 'toolbar-button'
      },
      'activity-listitem': {
        include: 'listitem',
        alias: 'listitem',
        style: function (states) {
          return {
            padding: [10, 20],
            backgroundColor: states.hovered || states.selected ? 'hovered' : null,
            textColor: undefined
          }
        }
      },

      'activity-listitem/content-container': {
        style: function () {
          return {
            font: 'message'
          }
        }
      },

      'activity-listitem/header': {
        style: function () {
          return {
            marginBottom: 4,
            allowGrowY: false
          }
        }
      },

      'activity-listitem/author-icon': {
        style: function () {
          return {
            font: 'sidebar-actor-icon',
            width: 50,
            height: 50,
            maxWidth: 50,
            maxHeight: 50,
            allowGrowX: false,
            allowGrowY: false,
            decorator: 'actor-icon',
            textColor: 'white',
            center: true,
            alignY: 'middle',
            alignX: 'center'
          }
        }
      },

      'activity-listitem/authorName': {
        include: 'label',
        style: function () {
          return {
            font: 'bold',
            alignY: 'middle',
            paddingRight: 4
          }
        }
      },
      'activity-listitem/authorUsername': {
        include: 'activity-listitem/authorName',

        style: function () {
          return {
            font: 'default',
            textColor: 'info-font',
            alignY: 'middle',
            alignX: 'center'
          }
        }
      },
      'activity-listitem/published': 'activity-listitem/authorUsername',
      'activity-listitem/authorRoles': 'activity-listitem/authorName',

      'authorRole-listitem': {
        include: 'listitem',
        alias: 'listitem',
        style: function () {
          return {
            padding: [2, 4],
            marginTop: 4,
            backgroundColor: 'info-font',
            textColor: 'white',
            decorator: 'rounded',
            allowGrowY: false,
            allowGrowX: false,
            alignY: 'middle',
            alignX: 'center',
            font: 'small'
          }
        }
      },

      'activity-group-item':
      {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            padding: 4,
            textAlign: 'center',
            font: 'activity-group',
            decorator: 'activity-group'
          }
        }
      },

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
      },

      'main/calendar/popup': {
        include: 'popup',
        alias: 'popup',
        style: function () {
          return {
            padding: 10
          }
        }
      },
      'main/calendar/renderer': 'event-activity',
      'main/calendar/renderer/toolbar': 'toolbar',
      'main/calendar/renderer/button-share': 'app-toolbar-button',
      'main/calendar/renderer/button-edit': 'app-toolbar-button',
      'main/calendar/renderer/button-delete': 'app-toolbar-button',

      /*
      ---------------------------------------------------------------------------
        SIDEBAR
      ---------------------------------------------------------------------------
      */
      'main/menu/actor-container': {
        style: function () {
          return {
            padding: 8
          }
        }
      },
      'main/menu/actor-name': {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            font: 'sidebar-headline',
            textColor: 'white'
          }
        }
      },

      'main/menu/actor-icon-box': {

        style: function () {
          return {
            font: 'sidebar-actor-icon',
            width: 40,
            height: 40,
            maxWidth: 40,
            maxHeight: 40,
            allowGrowX: false,
            allowGrowY: false,
            marginRight: 10
          }
        }
      },

      'main/menu/menu-button': {

        style: function () {
          return {
            icon: app.Config.icons.menu + '/20',
            show: 'icon',
            textColor: 'white',
            center: true
          }
        }
      },
      'main/menu/searchbar-container': {
        style: function () {
          return {
            padding: 8
          }
        }
      },
      'main/menu/searchbox/textfield': {

        style: function () {
          return {
            padding: [4, 8],
            decorator: 'channel-bar-form-items',
            allowGrowY: true
          }
        }
      },
      'main/menu/addchannel-button': {

        style: function () {
          return {
            marginLeft: 8,
            center: true,
            width: 37,
            height: 37,
            maxWidth: 37,
            maxHeight: 37,
            font: 'sidebar-actor-icon',
            decorator: 'channel-bar-form-items'
          }
        }
      },

      'main/menu/actor-status': {
        include: 'atom',
        alias: 'atom',
        style: function () {
          return {
            show: 'both',
            icon: app.Config.icons.online + '/12'
          }
        }
      },
      'main/menu/actor-status/icon': {

        style: function () {
          return {
            source: app.Config.icons.online + '/12'
          }
        }
      },

      'channel-group-item': {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            padding: [18, 8, 4, 8],
            font: 'bold',
            textColor: 'menu-text'
          }
        }
      },

      'channel-listitem': {
        include: 'listitem',
        alias: 'listitem',

        style: function () {
          return {
            padding: [0, 8, 0, 8],
            font: 'channel',
            textColor: 'inherit'
          }
        }
      },

      'channel-listitem/icon': {
        include: 'main/menu/actor-icon',
        alias: 'main/menu/actor-icon',

        style: function () {
          return {
            font: 'small',
            width: 20,
            height: 20,
            maxWidth: 20,
            maxHeight: 20,
            marginRight: 4,
            show: 'label',
            decorator: 'rounded',
            textColor: 'white',
            center: true
          }
        }
      },

      'channel-listitem/type': {
        style: function () {
          return {
            width: 16,
            height: 16,
            scale: true,
            margin: [0, 4, 0, 8]
          }
        }
      },
      'channel-listitem/name': {
        style: function () {
          return {
            allowGrowX: true
          }
        }
      },

      'channel-listitem/menu-button': {
        style: function () {
          return {

          }
        }
      },

      'main/menu': {
        style: function () {
          return {
            backgroundColor: 'menu-background',
            width: 280,
            minWidth: 280,
            maxWidth: 280,
            padding: 8,
            textColor: 'menu-text'
          }
        }
      },
      'main/menu/list': {
        include: 'list',
        alias: 'list',

        style: function () {
          return {
            backgroundColor: 'transparent',
            textColor: 'inherit',
            decorator: null
          }
        }
      },

      'main/channel/list': {
        include: 'list',
        alias: 'list',

        style: function () {
          return {
            decorator: null,
            backgroundColor: 'transparent'
          }
        }
      },

      'main/channel/status-bar': {
        style: function () {
          return {
            padding: [0, 10]
          }
        }
      },

      'main/channel/header': {
        style: function () {
          return {
            minHeight: 50,
            padding: [0, 20],
            backgroundColor: 'rgba(47, 52, 61, 0.2)'
          }
        }
      },

      'main/channel/header/title': {
        style: function () {
          return {
            margin: 8,
            gap: 4
          }
        }
      },

      'main/channel/header/title/label': {
        style: function () {
          return {
            font: 'channel'
          }
        }
      },

      'main/channel/header/title/icon': {
        style: function () {
          return {
            textColor: 'lightgrey'
          }
        }
      },

      'main/channel/header/favorite': {
        style: function (states) {
          return {
            textColor: states.enabled ? 'favorite' : 'lightgrey',
            height: 50,
            center: true
          }
        }
      },

      'main/channel/header/description': {
        style: function () {
          return {
            textColor: 'lightgrey',
            margin: 8
          }
        }
      },

      'main/channel/login-hint': {
        style: function () {
          return {
            padding: [0, 10],
            textAlign: 'center'
          }
        }
      },

      'main/calendar/header': 'main/channel/header',
      'main/calendar/status-bar': 'main/channel/status-bar',
      'main/calendar/calendar-container': {
        style: function () {
          return {
            margin: 10
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
       ACTIVITY EDITOR
      ---------------------------------------------------------------------------
      */
      'main/channel/message-field/textfield': {
        style: function () {
          return {
            decorator: 'form-field',
            margin: 4,
            padding: 10,
            font: 'message'
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
       SCROLLBAR
      ---------------------------------------------------------------------------
      */
      'scrollbar/slider': {
        style: function () {
          return {
            backgroundColor: 'rgba(100,100,100,0.1)'
          }
        }
      },
      'scrollbar/slider/knob': {
        style: function (states) {
          let decorator = 'scroll-knob'

          if (!states.disabled) {
            if (states.hovered && !states.pressed && !states.checked) {
              decorator = 'scroll-knob-hovered'
            } else if (states.hovered && (states.pressed || states.checked)) {
              decorator = 'scroll-knob-pressed-hovered'
            } else if (states.pressed || states.checked) {
              decorator = 'scroll-knob-pressed'
            }
          }

          return {
            height: 14,
            width: 10,
            cursor: states.disabled ? undefined : 'pointer',
            decorator: decorator,
            minHeight: states.horizontal ? undefined : 20,
            minWidth: states.horizontal ? 10 : undefined
          }
        }
      },

      'scrollbar/button': {},

      'button': {
        alias: 'button-frame',
        include: 'button-frame',

        style: function () {
          return {
            center: true,
            decorator: null
          }
        }
      }
    }
  })
