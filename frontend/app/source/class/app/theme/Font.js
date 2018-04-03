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

qx.Theme.define('app.theme.Font', {

  fonts: {
    'default': {
      size: 13,
      family: ['Roboto', 'Arial', 'sans-serif'],
      color: 'font'
    },

    'time-font': {
      size: 15,
      italic: true,
      family: ['Roboto', 'Arial', 'sans-serif'],
      color: 'font'
    },

    'message': {
      size: 15,
      family: ['Roboto', 'Arial', 'sans-serif'],
      color: 'font'
    },

    'bold': {
      size: 13,
      family: ['Roboto', 'Arial', 'sans-serif'],
      bold: true,
      color: 'font'
    },

    'activity-title': {
      size: 15,
      family: ['Roboto', 'Arial', 'sans-serif'],
      bold: true,
      color: 'font'
    },

    'small': {
      size: 12,
      family: ['Roboto', 'Arial', 'sans-serif'],
      color: 'font'
    },

    'monospace': {
      size: 12,
      family: [ 'DejaVu Sans Mono', 'Courier New', 'monospace' ],
      color: 'font'
    },

    'activity-group': {
      size: 12,
      family: ['Roboto', 'Arial', 'sans-serif'],
      bold: true,
      color: 'rgb(68, 68, 68)',
      lineHeight: 1.8
    },

    'channel': {
      size: 16,
      family: ['Roboto', 'Arial', 'sans-serif'],
      color: 'menu-text',
      lineHeight: 2.0
    },

    'sidebar-headline': {
      size: 14,
      family: ['Roboto', 'Arial', 'sans-serif'],
      bold: true
    },

    'event-day': {
      size: 20,
      family: ['Roboto', 'Arial', 'sans-serif']
    },

    'sidebar-actor-icon': {
      size: 26,
      family: ['Roboto', 'Arial', 'sans-serif']
    },

    'Roboto': {
      family: ['Roboto'],
      sources: [
        {
          family: 'Roboto',
          source: [
            '../resource/font/roboto/Roboto-Regular.ttf'
          ]
        }
      ]
    }
  }
})
