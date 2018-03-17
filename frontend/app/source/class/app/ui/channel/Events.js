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

    this.__qxEvent = new qx.event.type.Pointer()
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __calendar: null,
    __qxEvent: null,

    _applySubscription: function (subscription, oldSubscription) {
      this.base(arguments, subscription, oldSubscription)
      this.addListenerOnce('subscriptionApplied', () => {
        if (this.isAllowed('d')) {
          this.getChildControl('renderer').getChildControl('button-delete').show()
        } else {
          this.getChildControl('renderer').getChildControl('button-delete').exclude()
        }
        if (this.isAllowed('u')) {
          this.getChildControl('renderer').getChildControl('button-edit').show()
        } else {
          this.getChildControl('renderer').getChildControl('button-edit').exclude()
        }
      })
    },

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
      let events = []
      if (!this.getSubscription()) {
        callback(events)
        return
      }
      const startDate = start.toDate()
      const endDate = end.toDate()
      this.debug('collect events from', startDate, 'to', endDate)
      const actor = app.Model.getInstance().getActor()
      const channelRelation = app.Model.getInstance().getChannelRelation(this.getSubscription().getChannel())

      const acls = this.getChannelActivitiesAcls()

      this.getActivities().forEach(act => {
        if (act.getType() === 'Event') {
          const event = act.getContentObject()
          if (event.getEnd() >= startDate && event.getStart() <= endDate) {
            // workaround for wrong allDay events
            const data = Object.assign({
              title: event.getName(),
              id: act.getId()
            }, act.getContent())
            // use the parsed date objects
            data.start = event.getStart()
            data.end = event.getEnd()
            data.allDay = event.isAllDay()
            if (data.categories && data.categories.length > 0) {
              data.title = `${data.categories.join(', ')}: ${data.title}`
            }
            let aclTypeToCheck = 'actions'
            if (actor) {
              if (actor.getId() === data.id) {
                aclTypeToCheck = 'ownerActions'
              } else if (channelRelation === 'member') {
                aclTypeToCheck = 'memberActions'
              }
            }
            // check event permissions
            data.editable = acls.hasOwnProperty(aclTypeToCheck) && acls[aclTypeToCheck].includes('u')
            events.push(data)
          }
        }
      })
      console.log(events)
      callback(events)
    },

    /**
     * Handle clicks on events
     * @param calEvent {Object} calendar event which has been changed
     * @param jsEvent {Event} native browser event
     * @param view {Object} current view
     * @protected
     */
    _onEventClick: function (calEvent, jsEvent, view) {
      const popup = this.getChildControl('popup')
      if (popup.getVisibility() !== 'visible') {
        this.getActivities().forEach(act => {
          if (act.getId() === calEvent.id) {
            this.getChildControl('renderer').setModel(act)
            return true
          }
        })
        this.__qxEvent.init(jsEvent)
        popup.placeToPointer(this.__qxEvent)
        popup.show()
      }
      return false
    },

    _editActivity: function () {
      // TODO: open editor for event
    },

    /**
     * Handle event resize events which are fired after an event has been changed in duration
     * @param event {Object} calendar event which has been changed
     * @param delta {Object} duration object that represents the amount of time the event’s end was extended by
     * @param revertFunc {Function} is a function that, if called, reverts the event’s end date to the value before the drag. This is useful if an ajax call should fail.
     * @param jsEvent {Event} holds the native javascript event with low-level information such as mouse coordinates.
     * @param ui {null} holds an empty object Before version 2.1, the jQuery UI object.
     * @param view {Object} the current view object
     * @protected
     */
    _onEventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
      console.log(event.title + ' end is now ' + event.end.format())
      app.io.Rpc.getProxy().updateObjectProperty('Activity',
        event.id,
        {
          content: {
            end: event.end.format()
          }
        }).catch(err => {
        this.error(err)
        revertFunc()
      })
    },

    /**
     * Handle event drop events which are fired after an event has been moved to a different day/time
     * @param event {Object} calendar event which has been changed
     * @param delta {Object} duration object that represents the amount of time the event’s end was extended by
     * @param revertFunc {Function} is a function that, if called, reverts the event’s end date to the value before the drag. This is useful if an ajax call should fail.
     * @param jsEvent {Event} holds the native javascript event with low-level information such as mouse coordinates.
     * @param ui {null} holds an empty object Before version 2.1, the jQuery UI object.
     * @param view {Object} the current view object
     * @protected
     */
    _onEventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
      app.io.Rpc.getProxy().updateObjectProperty('Activity',
        event.id,
        {
          content: {
            end: event.end.format(),
            start: event.start.format()
          }
        }).catch(err => {
        this.error(err)
        revertFunc()
      })
    },

    __init: function () {
      this.__calendar = $('#calendar')
      this.__calendar.fullCalendar({
        // put your options and callbacks here
        defaultView: 'month',
        header: {
          left: app.Config.target === 'mobile' ? 'prev' : 'prev,next today',
          center: 'title',
          right: app.Config.target === 'mobile' ? 'next' : 'month,agendaWeek,agendaDay,listMonth'
        },
        eventLimit: true, // allow "more" link when too many events
        locale: qx.locale.Manager.getInstance().getLocale(),
        height: 'parent',
        timezoneParam: 'UTC',
        events: this._getEvents.bind(this),
        eventClick: this._onEventClick.bind(this),
        eventResize: this._onEventResize.bind(this),
        eventDrop: this._onEventDrop.bind(this)
      })
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'calendar-container':
          control = new qx.ui.core.Widget()
          control.set({
            allowGrowX: true,
            allowGrowY: true
          })
          control.getContentElement().setAttribute('id', 'calendar')
          this._add(control, {flex: 1})
          control.addListenerOnce('appear', this.__init, this)
          break

        case 'popup':
          control = new qx.ui.popup.Popup(new qx.ui.layout.Grow())
          break

        case 'renderer':
          control = new app.ui.renderer.Event('popup')
          control.addListener('delete', (ev) => {
            this._deleteActivity(ev)
            this.getChildControl('popup').hide()
          })
          control.addListener('share', (ev) => {
            this._shareActivity(ev)
            this.getChildControl('popup').hide()
          })
          control.addListener('edit', (ev) => {
            this._editActivity(ev)
            this.getChildControl('popup').hide()
          })
          this.getChildControl('popup').add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
