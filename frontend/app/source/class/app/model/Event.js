/**
 * Event
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.model.Event', {
  extend: app.model.Activity,

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
      transform: "_transformDate"
    },
    end: {
      check: 'Date',
      nullable: true,
      event: 'changeEnd',
      transform: "_transformDate"
    },
    categories: {
      check: "Array",
      nullable: true,
      event: 'changeCategories'
    },
    organizer: {
      check: "String",
      nullable: true,
      event: 'changeOrganizer'
    }
  }
});