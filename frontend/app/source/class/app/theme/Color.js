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

qx.Theme.define('app.theme.Color',
  {
    extend: qx.theme.indigo.Color,

    colors:
    {
      'activity-group-line': '#eaeaea',
      'info-font': '#a0a0a0',
      'menu-background': 'rgb(47, 52, 61)',
      'menu-text': 'rgb(158, 162, 168)',
      'background-selected': 'rgb(65, 72, 82)',
      'lightgrey': 'rgba(68, 68, 68, 0.4)',
      'favorite': 'rgb(252, 179, 22)',
      'category-bg': 'rgba(200, 200, 200, 0.6)',
      'background': '#F5F0EB',
      'bg-own-message': '#eeeeee',

      'bg-message': 'white',

      // channel-bar
      'dark-form-item-bg': 'rgb(31, 35, 41)',

      // scrollbar
      'scrollbar-bright': 'rgb(150, 150, 150)',
      'scrollbar-dark': 'rgb(100, 100, 100)',

      // user state colors
      'user-online': '#21C01E',
      'user-away': 'rgb(255, 210, 31)',
      'user-busy': 'rgb(245, 69, 92)',
      'user-invisible': 'rgb(203, 206, 209)',
      'user-offline': '#222222',

      // activity items
      'event-default-bg': 'rgb(15, 108, 0)',
      'hovered': '#EFEFEF',
      'link-color': 'rgb(19, 103, 154)',

      // buttons
      'button-border': 'rgba(68, 68, 68, 0.1)'
    }
  })
