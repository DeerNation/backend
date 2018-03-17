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
    name: {
      check: 'String',
      init: null,
      event: 'changedName'
    },
    location: {
      check: 'String',
      event: 'changeLocation',
      nullable: true
    },
    start: {
      check: 'Date',
      nullable: true,
      event: 'changeStart',
      transform: '_transformDate',
      apply: '_applyTime'
    },
    end: {
      check: 'Date',
      nullable: true,
      event: 'changeEnd',
      transform: '_transformDate',
      apply: '_applyTime'
    },
    categories: {
      check: 'qx.data.Array',
      nullable: true,
      event: 'changeCategories',
      transform: '_transformArray'
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
    },
    allDay: {
      check: 'Boolean',
      init: false,
      event: 'changedAllDay'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _transformArray: function (value) {
      return new qx.data.Array(value)
    },

    _applyTime: function () {
      if (this.getStart() && this.getEnd() && !this.isAllDay()) {
        // check if this is an allday event
        const durationInDays = (this.getEnd() - this.getStart()) / (24 * 60 * 60 * 1000)
        this.setAllDay(Number.isInteger(durationInDays) &&
          this.getStart().getHours() === 0 && this.getEnd().getHours() === 0)
      }
    }
  },

  defer: function (statics) {
    app.model.activity.Registry.getInstance().register('event', statics, app.ui.renderer.Event, app.ui.form.Event)
  }
})
