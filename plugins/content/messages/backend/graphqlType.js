/**
 * graphqlType for Events
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const { GraphQLObjectType, GraphQLString } = require('graphql')

const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    message: {
      type: GraphQLString
    },
    link: {
      type: GraphQLString
    }
  })
})

module.exports = {
  graphQlType: MessageType,
  qglTypeResolver: function (value) {
    return value.hasOwnProperty('message')
  }
}
