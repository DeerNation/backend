/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

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
        FORM ELEMENTS
      ---------------------------------------------------------------------------
      */
      'app-textfield': {
        include: 'textfield',
        alias: 'textfield',

        style: function () {
          return {
            padding: [4, 8],
            decorator: 'textfield'
          }
        }
      },

      'app-datefield': {
        include: 'datefield',
        alias: 'datefield',

        style: function () {
          return {
            padding: [4, 8],
            decorator: 'textfield'
          }
        }
      },

      'app-datefield/button': {
        alias: 'datefield/button',
        include: 'datefield/button',

        style: function () {
          return {
            icon: '@Material/date_range/16',
            textColor: 'menu-text'
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
      },

      /*
      ---------------------------------------------------------------------------
       CHANNEL VIEW
      ---------------------------------------------------------------------------
      */
      'channel-view': {},
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

      'channel-view/editor-container': {
        style: function () {
          return {
            decorator: 'activity-group',
            paddingTop: 8
          }
        }
      },

      'channel-view/add-button': {
        style: function () {
          return {
            decorator: 'add-button',
            textColor: 'menu-text',
            show: 'icon',
            center: true
          }
        }
      }
    }
  })
