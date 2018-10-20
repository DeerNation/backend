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

  registerActivityContent (payload) {
    Object.keys(payload).forEach(name => {
      const refs = this.__schemes.Activity.properties.payload.oneOf
      let exists = false
      refs.some(ref => {
        if (ref['$ref'] === '#/payloadTypes/' + name) {
          exists = true
          return true
        }
      })
      if (exists) {
        throw new Error('Content already registered')
      }
      logger.debug('registering payload schema for %s', name)
      refs.push({'$ref': '#/payloadTypes/' + name})
      this.__schemes.Activity.payloadTypes[name] = payload[name]
    })
  }
}

const handler = new JsonSchemaHandler()

module.exports = handler
