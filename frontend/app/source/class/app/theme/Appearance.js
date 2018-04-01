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
        alias: 'toolbar-button',

        style: function () {
          return {
            decorator: undefined
          }
        }
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
      },

      'throbber': {
        style: function (states) {
          return {
            textColor: 'lightgrey',
            backgroundColor: states.blocking ? 'rgba(255,255,255,0.95)' : 'transparent',
            show: 'icon',
            size: 30,
            zIndex: 10000,
            center: true
          }
        }
      }
    }
  })
