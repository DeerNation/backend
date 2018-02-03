/**
 * Activity
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.model.Activity', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments, props)
    this.initCreated(new Date())
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
    },

    actor: {
      check: 'Object',
      init: null,
      event: 'changeActor'
    }
  }
})
