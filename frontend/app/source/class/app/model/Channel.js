
/**
 * Channel objact holding mete information about a channel
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.model.Channel', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments, props)
    if (!this.getColor()) {
      this.setColor(app.model.Channel.getRandomColor())
    }
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    getRandomColor: function () {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }
  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */
  properties: {

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
    },

    color: {
      check: 'Color',
      init: null,
      event: 'changedColor'
    }
  }
})
