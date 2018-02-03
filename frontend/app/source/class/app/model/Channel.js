
/**
 * Channel objact holding mete information about a channel
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.model.Channel', {
  extend: app.model.AbstractModel,

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */
  properties: {

    id: {
      check: 'String',
      init: null,
      event: 'changedId'
    },

    type: {
      check: ['PUBLIC', 'PRIVATE'],
      init: 'PUBLIC',
      event: 'changedType'
    },

    title: {
      check: 'String',
      init: null,
      event: 'changedTitle'
    },

    description: {
      check: 'String',
      init: null,
      event: 'changedDescription'
    },

    /**
     * Owner of the channel
     */
    ownerId: {
      check: 'String',
      init: null,
      event: 'changedOwnerId'
    },

    /**
     * Channel creation date
     */
    created: {
      check: 'Date',
      init: null,
      transform: '_transformDate',
      event: 'changedCreated'
    }
  }
})
