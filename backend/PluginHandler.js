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
 * PluginHandler
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const logger = require('./logger')(__filename)
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const schemaHandler = require('./model/JsonSchemaHandler')
// const graphQL = require('./model/graphql-thinky')
// const schema = require('./model/schema')
const channelHandler = require('./ChannelHandler')
const config = require('./config')
const {TYPE_URL_TEMPLATE} = require('./model/any')
const {setSchema} = require('./model/dgraph')
const proto = require('./model/protos')
const {protoProcessor} = require('./model/ProtoProcessor')
const {dgraphService} = require('./model/dgraph')

class PluginHandler {
  constructor () {
    if (config.PLUGINS_CONTENT_DIR) {
      this._paths = [config.PLUGINS_CONTENT_DIR]
    } else {
      logger.warn('no plugin path defined. Using the DeerNation-backend without any plugin is not recommended!')
      this._paths = []
    }

    logger.debug('using plugin paths: %s', this._paths)
  }

  /**
   * Read existing plugins and register them in the right places
   */
  init () {
    this._paths.forEach(pluginPath => {
      const manifests = glob.sync(pluginPath + '/*/Manifest.json')
      manifests.forEach(manifestPath => {
        this._importPlugin(JSON.parse(fs.readFileSync(manifestPath, 'utf8')), path.dirname(manifestPath))
      })
    })
  }

  _importPlugin (manifest, pluginDir) {
    switch (manifest.provides.type) {
      case 'contentPlugin':
        this._importContentPlugin(manifest, pluginDir)
        break
      default:
        logger.error('Unhandled plugin type: %s', manifest.provides.type)
        break
    }
  }

  _importContentPlugin (manifest, pluginDir) {
    if (!manifest.provides.hasOwnProperty('id')) {
      throw Error('Not id found in content plugin manifest')
    }
    const id = manifest.provides.id
    // register content type for activity schema
    // schema.registerContentType(id, manifest.provides.hasOwnProperty('defaultType') && manifest.provides.defaultType === true)

    // read JSON schemo for Activity content
    const schemaFile = path.join(pluginDir, manifest.provides.jsonSchema)
    if (!fs.existsSync(schemaFile)) {
      logger.error('JSON Schema file not found: %s', schemaFile)
    } else {
      const contentSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'))
      schemaHandler.registerActivityContent(contentSchema)
    }

    // read graphql type
    // if (manifest.provides.hasOwnProperty('graphQlType')) {
    //   const graphQlTypeFile = path.join(pluginDir, manifest.provides.graphQlType)
    //   if (!fs.existsSync(graphQlTypeFile)) {
    //     logger.error('GraphQL type file not found: %s', graphQlTypeFile)
    //   } else {
    //     const {graphQlType, qglTypeResolver} = require(graphQlTypeFile)
    //     graphQL.registerContentType(graphQlType, qglTypeResolver)
    //   }
    // }

    if (manifest.provides.hasOwnProperty('notification')) {
      const notificationFile = path.join(pluginDir, manifest.provides.notification)
      channelHandler.registerNotificationHandler(TYPE_URL_TEMPLATE.replace('$ID', id), require(notificationFile))
    }

    // apply schema for plugin
    const schema = protoProcessor.getSchemaDefinition(proto.plugins[id].Payload)
    if (schema) {
      setSchema(schema)
    }

    if (manifest.provides.hasOwnProperty('queryHandler')) {
      const handlerFiler = path.join(pluginDir, manifest.provides.queryHandler)
      dgraphService.registerPayloadQueryHandler(id, require(handlerFiler))
    }
  }
}

const handler = new PluginHandler()
module.exports = handler
