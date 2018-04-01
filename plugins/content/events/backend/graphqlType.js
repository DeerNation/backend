/**
 * graphqlType for Events
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const { GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql')

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: () => ({
    name: {
      type: GraphQLString
    },
    location: {
      type: GraphQLString
    },
    start: {
      type: GraphQLString
    },
    end: {
      type: GraphQLString
    },
    categories: {
      type: new GraphQLList(GraphQLString)
    },
    organizer: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    }
  })
})

module.exports = {
  graphQlType: EventType,
  qglTypeResolver: function (value) {
    return value.hasOwnProperty('start')
  }
}
