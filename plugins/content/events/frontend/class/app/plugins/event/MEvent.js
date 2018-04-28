/**
 * Event
 *
 * @author tobiasb
 * @since 2018
 * @require(app.model.activity.Registry)
 */

qx.Mixin.define('app.plugins.event.MEvent', {
  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.addListener('changeStart', this._checkAllDay, this)
    this.addListener('changeEnd', this._checkAllDay, this)
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
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
    _checkAllDay: function () {
      if (this.getStart() && this.getEnd() && !this.isAllDay()) {
        // check if this is an allday event
        const durationInDays = (this.getEnd() - this.getStart()) / (24 * 60 * 60 * 1000)
        this.setAllDay(Number.isInteger(durationInDays) &&
          this.getStart().getHours() === 0 && this.getEnd().getHours() === 0)
      }
    }
  }
})
