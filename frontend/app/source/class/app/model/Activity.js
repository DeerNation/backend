/**
 * Activity
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.model.Activity', {
  extend: qx.core.Object,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments)
    this.initCreated(new Date())
    this.set(props)
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    id: {
      check: 'String'
    },

    title: {
      check: 'String',
      nullable: true,
      event: 'changeTitle'
    },

    content: {
      check: 'String',
      nullable: true,
      event: 'changeContent'
    },

    /* Creation date of this Activity */
    created: {
      check: 'Date',
      deferredInit: true,
      event: 'changeCreated',
      transform: '_transformDate'
    },

    /* Publication date of this Activity */
    published: {
      check: 'Date',
      nullable: true,
      event: 'changePublished',
      transform: '_transformDate'
    },

    actorId: {
      check: 'String',
      init: null
    },

    hash: {
      check: 'String',
      init: null
    },

    channel: {
      check: 'String',
      init: null
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    _transformDate: function (value) {
      if (qx.lang.Type.isString(value)) {
        return new Date(value)
      }
      return value
    }
  }

})
