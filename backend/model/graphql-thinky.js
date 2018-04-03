/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * graphql-thinky
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLUnionType, graphql, parse } = require('graphql')
require('babel-polyfill')
require('babel-register')
const GraphQLThinky = require('graphql-thinky').default

class GqlHandler {
  constructor () {
    this._graphqlThinky = null
    this._schema = null
    this._query = null
    this._types = {}
    this._contentTypeResolvers = []
    this._contentType = new GraphQLUnionType({
      name: 'content',
      types: [],
      resolveType (value) {
        let type = null
        this._contentTypeResolvers.some(tuple => {
          if (tuple[0](value)) {
            type = tuple[1]
            return true
          }
        })
        return type
      }
    })
  }

  init (thinky) {
    this._graphqlThinky = new GraphQLThinky(thinky)
    // create models
    this._types.Activity = this._graphqlThinky.createModelType('Activity')
    const fields = this._types.Activity.getFields()
    fields.content = {type: this._contentType, name: 'content', isDeprecated: false, args: []}
  }

  registerContentType (newContentType, resolver) {
    const types = this._contentType.getTypes()
    if (!types.includes(newContentType)) {
      types.push(newContentType)
      this._contentTypeResolvers.push([resolver, newContentType])
    }
  }

  prepareClientError (res) {
    const {errors, data} = res
    if (!errors) {
      return res
    }
    const error = errors[0].message
    if (error.indexOf('{"_error"') === -1) {
      console.log('DEBUG GraphQL Error:', error)
      return {error: JSON.stringify({_error: 'Server error while querying data'}), data}
    }
    return {error, data}
  }

  attach (socket) {
    socket.on('graphql', async (body, res) => {
      const {query, variables, ...rootVals} = body
      const authToken = socket.getAuthToken()
      const result = await graphql(this.getSchema(), query, {authToken, ...rootVals}, variables)
      const {error, data} = this.prepareClientError(result)
      res(error, data)
    })
  }

  getModelLoaders () {
    return this._graphqlThinky.getModelLoaders()
  }

  getSchema () {
    if (!this._schema) {
      this._schema = new GraphQLSchema({
        query: this.getQuery()
      })
    }

    return this._schema
  }

  getQuery () {
    if (!this._query) {
      // User query definition
      const activityQuery = {
        activities: {
          type: new GraphQLList(this._types.Activity),
          resolve: this._graphqlThinky.resolve('Activity')
        },
        activity: {
          type: this._types.Activity,
          args: {
            id: {
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: this._graphqlThinky.resolve('Activity')
        }
      }
      // Export query
      this._query = new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          ...activityQuery
        })
      })
    }
    return this._query
  }
}

let gqlHandler = new GqlHandler()
module.exports = gqlHandler
