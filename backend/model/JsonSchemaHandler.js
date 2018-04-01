/**
 * Handles available JSON schemas including parts from plugins
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const logger = require('../logger')(__filename)

class JsonSchemaHandler {
  constructor () {
    logger.debug('creating schema handler')
    this.__schemes = {}
    // read existing schemas
    glob.sync(path.join(__dirname, 'json', '*.json')).forEach(schemaFile => {
      const name = path.basename(schemaFile, '.json')
      logger.debug('loading JSON schema for %s', name)
      this.__schemes[name] = JSON.parse(fs.readFileSync(schemaFile, 'utf8'))
    })
  }

  getSchema (name) {
    return this.__schemes[name]
  }

  registerActivityContent (content) {
    Object.keys(content).forEach(name => {
      const refs = this.__schemes.Activity.properties.content.oneOf
      let exists = false
      refs.some(ref => {
        if (ref['$ref'] === '#/contentTypes/' + name) {
          exists = true
          return true
        }
      })
      if (exists) {
        throw new Error('Content already registered')
      }
      logger.debug('registering content schema for %s', name)
      refs.push({'$ref': '#/contentTypes/' + name})
      this.__schemes.Activity.contentTypes[name] = content[name]
    })
  }
}

const handler = new JsonSchemaHandler()

module.exports = handler
