/**
 * Actor model class
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.model.Actor', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    id: {
      check: 'String',
      init: null
    },
    name: {
      check: 'String',
      init: '',
      event: 'changedName'
    },
    type: {
      check: ['Person', 'Server', 'Bot'],
      init: 'Person'
    },
    role: {
      check: 'String',
      nullable: true
    },
    desc: {
      check: 'String',
      nullable: true
    },
    email: {
      check: 'String',
      nullable: true,
      validate: qx.util.Validate.email()
    },
    username: {
      check: 'String',
      init: null
    },
    password: {
      check: 'String',
      init: null
    },
    defaultNotification: {
      check: 'Object',
      nullable: true
    },
    online: {
      check: 'Boolean',
      init: false,
      event: 'changeOnline'
    },
    status: {
      check: 'String',
      init: null
    }
  }
})
