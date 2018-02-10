/**
 * Activity
 *
 * @author tobiasb
 * @since 2018
 * @require(app.model.activity.content.Event)
 * @require(app.model.activity.content.Message)
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

    title: {
      check: 'String',
      nullable: true,
      event: 'changeTitle'
    },

    type: {
      check: ['Message', 'Event'],
      init: null,
      apply: '_updateContentObject'
    },

    content: {
      check: 'Object',
      nullable: true,
      apply: '_updateContentObject'
    },

    contentObject: {
      check: 'app.model.activity.content.AbstractActivityContent',
      nullable: true,
      event: 'changedContentObject'
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
      init: null,
      apply: '_applyActorId'
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
      check: 'app.model.Actor',
      init: null,
      event: 'changeActor'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    // property apply
    _applyActorId: function (value) {
      if (value) {
        this.setActor(app.Model.lookup('actor', value))
      }
    },

    /**
     * Transform data to activity content object
     * @protected
     */
    _updateContentObject: function () {
      if (!this.getType() || !this.getContent()) {
        // property not ready
        return
      }
      const Clazz = qx.Class.getByName('app.model.activity.content.' + this.getType())
      qx.core.Assert.assertNotNull(Clazz)
      return new Clazz(this.getContent())
    }
  }
})
