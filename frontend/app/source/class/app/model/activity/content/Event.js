/**
 * Event
 *
 * @author tobiasb
 * @since 2018
 * @require(app.model.activity.Registry)
 */

qx.Class.define('app.model.activity.content.Event', {
  extend: app.model.activity.content.AbstractActivityContent,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    location: {
      check: 'String',
      event: 'changeLocation'
    },
    start: {
      check: 'Date',
      nullable: true,
      event: 'changeStart',
      transform: '_transformDate'
    },
    end: {
      check: 'Date',
      nullable: true,
      event: 'changeEnd',
      transform: '_transformDate'
    },
    categories: {
      check: 'Array',
      nullable: true,
      event: 'changeCategories'
    },
    organizer: {
      check: 'String',
      nullable: true,
      event: 'changeOrganizer'
    },
    description: {
      check: 'String',
      nullable: true,
      event: 'changedDescription'
    }
  },

  defer: function (statics) {
    app.model.activity.Registry.getInstance().register('event', statics, app.ui.renderer.Event, app.ui.form.Event)
  }
})
