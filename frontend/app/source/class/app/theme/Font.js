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
