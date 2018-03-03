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
    this._setLayout(new qx.ui.layout.Canvas())
    const calendar = this._calendarWidget = new qx.ui.core.Widget()
    calendar.getContentElement().setAttribute('id', 'calendar')
    this._add(calendar, {edge: 10})

    calendar.addListenerOnce('appear', this.__init, this)

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
            if (Number.isInteger(durationInDays)) {
              data.allDay = true
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
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listMonth'
        },
        weekNumbers: true,
        eventLimit: true, // allow "more" link when too many events
        locale: qx.locale.Manager.getInstance().getLocale(),
        height: 'parent',
        timezoneParam: 'Europe/Berlin',
        events: this._getEvents.bind(this)
      })
    }
  }
})
