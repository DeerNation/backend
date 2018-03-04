/**
 * Calendar
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @ignore($)
 */
qx.Class.define('app.ui.channel.Events', {
  extend: app.ui.channel.AbstractChannel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())
    this._createChildControl('header')
    this._createChildControl('calendar-container')
    this._createChildControl('status-bar')

    this.addListener('refresh', this.__refresh, this)
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __calendar: null,

    /**
     * Refresh calendar events
     * @private
     */
    __refresh: function () {
      if (this.__calendar) {
        this.__calendar.fullCalendar('refetchEvents')
      }
    },

    _getEvents: function (start, end, timezone, callback) {
      const startDate = start.toDate()
      const endDate = end.toDate()
      this.debug('collect events from', startDate, 'to', endDate)
      let events = []
      const dayInMs = (24 * 60 * 60 * 1000)
      this.getActivities().forEach(act => {
        if (act.getType() === 'Event') {
          const event = act.getContentObject()
          if (event.getEnd() >= startDate && event.getStart() <= endDate) {
            // workaround for wrong allDay events
            const durationInDays = (event.getEnd() - event.getStart()) / dayInMs
            const data = Object.assign(act.getContent(), {
              title: act.getTitle(),
              id: act.getId()
            })
            // use the parsed date objects
            data.start = event.getStart()
            data.end = event.getEnd()
            if (Number.isInteger(durationInDays) &&
              event.getStart().getHours() === 0 && event.getEnd().getHours() === 0) {
              data.allDay = true
            }
            if (data.categories && data.categories.length > 0) {
              data.title = `${data.categories.join(', ')}: ${data.title}`
            }
            events.push(data)
          }
        }
      })
      console.log(events)
      callback(events)
    },

    __init: function () {
      this.__calendar = $('#calendar')
      this.__calendar.fullCalendar({
        // put your options and callbacks here
        defaultView: 'month',
        header: {
          left: app.Config.target === 'mobile' ? 'prev,next' : 'prev,next today',
          center: 'title',
          right: app.Config.target === 'mobile' ? 'month,agendaWeek,agendaDay' : 'month,agendaWeek,agendaDay,listMonth'
        },
        eventLimit: true, // allow "more" link when too many events
        locale: qx.locale.Manager.getInstance().getLocale(),
        height: 'parent',
        timezoneParam: 'UTC',
        events: this._getEvents.bind(this)
      })
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'calendar-container':
          control = new qx.ui.core.Widget()
          control.getContentElement().setAttribute('id', 'calendar')
          this._add(control, {flex: 1})
          control.addListenerOnce('appear', this.__init, this)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
