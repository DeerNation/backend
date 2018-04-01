qx.Theme.define('app.plugins.event.theme.Decoration', {
  decorations: {
    'date-sheet': {
      style: {
        radius: 6,
        width: [0, 1, 0, 1],
        innerWidth: [5, 0],
        innerColor: 'event-default-bg',
        color: 'menu-background',
        style: 'solid',
        shadowBlurRadius: 4,
        shadowVerticalLength: 2,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        inset: false
      }
    },
    'category': {
      style: {
        radius: 10,
        color: 'info-font',
        width: 1,
        backgroundColor: 'category-bg',
        shadowBlurRadius: 3
      }
    }
  }
})
