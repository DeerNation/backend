/**
 * GraphQL
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.io.GraphQL', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    test: function () {
      const query = `
      query Q {
        activities {
          id
          type
          title
          content {
            ... on Message {
              message
            }
            ... on Event {
              name
              start
              end
              categories
            }
          }
        }
      }`
      // app.io.Socket.getInstance().emit('graphql', {
      //   query: query
      // }, (err, res) => {
      //   if (err) {
      //     console.error(err)
      //   } else {
      //     // console.log(res)
      //   }
      // })
    }
  }
})
