const any = require('./any')
const proto = require('./protos')
const logger = require('../logger')(__filename)

/**
 * This class provides methods to prepare Objects defined by proto files to be written to the
 * dgraph database and the other way around.
 *
 * proto -> graph
 * dgraph -> proto
 *
 * It also extract index information from proto definitions to create indices and schema definitions in dgraph for certain edges.
 */
class ProtoProcessor {
  constructor () {
    this.__tagRegex = /([^=]+)="([^"]+)"/g
    this.__propertyMappings = {}
    this.__edgeMappings = {}
    this._modelNamespace = proto.dn.model.Activity.parent
  }

  /**
   * Convert the (deserialized) content of an "any"-type message (consists of a type_url and a value, which can be either
   * an object or an object as JSON string) into a model that can be saved into the database.
   * @param content {{type_url: string, value: Map|String}}
   * @returns {Map}
   */
  anyToModel (content) {
    if (!content || !content.type_url) {
      logger.error('content format error: %o', content)
    }
    const type = any.getType(content.type_url)
    if (!type) {
      throw new Error('unable to get type from type url: ' + content.type_url)
    }
    const value = typeof content.value === 'string' ? JSON.parse(content.value) : content.value
    logger.debug('converting type ' + type + ' from any to model')
    if (!proto.plugins[type] || !proto.plugins[type].Payload) {
      throw Error('no proto definition found for proto.plugins.' + type + '.Payload')
    }
    const payload = this.toDb(proto.plugins[type].Payload, value)
    if (content.uid) {
      payload.uid = content.uid
    }
    payload.baseName = 'payload.' + type
    return payload
  }

  /**
   * Converts a model read from the datebase into an object that can be used as source for an "any" type message.
   * @param model {Map} model read from database
   * @returns {{type_url: string, value: Map}}
   */
  modelToAny (model) {
    const type = model.baseName.replace(/^payload\./, '').toLowerCase()
    if (!proto.plugins[type] || !proto.plugins[type].Payload) {
      throw Error('no proto definition found for proto.plugins.' + type + '.Payload')
    }
    logger.debug('converting type ' + type + ' from model to any')
    return {
      type_url: any.TYPE_URL_TEMPLATE.replace('$ID', type),
      value: this.fromDb(proto.plugins[type].Payload, model)
    }
  }

  /**
   * Convert a model from a proto message to an object that can be stored in the database.
   * @param protoMessage {Object} proto definition for the model
   * @param model {Map}
   * @return {Map}
   */
  toDb (protoMessage, model) {
    if (!model) {
      throw new Error('no model provided')
    }
    var converted = {}
    const prefix = this.__getPrefix(protoMessage)
    protoMessage.fieldsArray.forEach(fieldDef => {
      if (model.hasOwnProperty(fieldDef.name) && (model[fieldDef.name] || model[fieldDef.name] === 0)) {
        if (fieldDef.name === 'uid') {
          converted.uid = model[fieldDef.name]
        } else {
          converted[prefix + fieldDef.name] = model[fieldDef.name]
        }
      }
    })
    return converted
  }

  /**
   * Convert model read from database to one that can be used to generate a proto message.
   * @param protoMessage {Object} proto definition for the model
   * @param model {Object} model read from the database
   * @return {Map}
   */
  fromDb (protoMessage, model) {
    if (!model) {
      throw new Error('no model provided')
    }
    var converted = {}
    const prefix = this.__getPrefix(protoMessage)
    protoMessage.fieldsArray.forEach(fieldDef => {
      if (model.hasOwnProperty(fieldDef.name)) {
        converted[fieldDef.name] = model[fieldDef.name]
      } else if (model.hasOwnProperty(prefix + fieldDef.name)) {
        converted[fieldDef.name] = model[prefix + fieldDef.name]
      }
    })
    return converted
  }

  /**
   * Recursively map objects edge names to property names to prepare the
   * object received from the database to be srielized in a proto message.
   * @param object {Map}
   * @returns {Map}
   */
  mapEdgesToProperties (object) {
    if (Array.isArray(object)) {
      return object.map(obj => {
        return this.__mapEdgesToProperties(obj)
      })
    } else {
      return this.__mapEdgesToProperties(object)
    }
  }

  // TODO: convert single value arrays if UID types to the value itself
  __mapEdgesToProperties (object) {
    if (object.baseName && this._modelNamespace.hasOwnProperty(object.baseName)) {
      if (!this.__propertyMappings.hasOwnProperty(object.baseName)) {
        this.__readPropertyToEdgemappings(object.baseName)
      }
      const mapping = this.__edgeMappings[object.baseName]

      Object.keys(object).map(key => {
        let value = object[key]
        if (Array.isArray(value)) {
          logger.warn('array handling not implemented yet')
        } else if (typeof value === 'object' && value.constructor.name === 'Object') {
          if (value.baseName) {
            // dig deeper
            value = this.__mapEdgesToProperties(value)
          }
        }
        if (mapping !== false && mapping.hasOwnProperty(key)) {
          object[mapping[key]] = value
          delete object[key]
        }
      })
    }
  }

  /**
   * Recursively map objects properties to edge names to prepare the
   * object for being save in the database. It also adds missing ``baseName`` properties to the objects.
   * @param object {Map}
   * @returns {Map}
   */
  mapPropertiesToEdges (object) {
    if (Array.isArray(object)) {
      return object.map(obj => {
        return this.__mapPropertiesToEdges(obj)
      })
    } else {
      return this.__mapPropertiesToEdges(object)
    }
  }

  __mapPropertiesToEdges (object) {
    // only map model messages, payload plugins are mapped somwhere else)
    if (object.baseName && this._modelNamespace.hasOwnProperty(object.baseName)) {
      if (!this.__propertyMappings.hasOwnProperty(object.baseName)) {
        this.__readPropertyToEdgemappings(object.baseName)
      }
      const mapping = this.__propertyMappings[object.baseName]
      Object.keys(object).map(key => {
        let value = object[key]
        if (Array.isArray(value)) {
          logger.warn('array handling not implemented yet')
        } else if (typeof value === 'object' && value.constructor.name === 'Object') {
          if (!value.baseName) {
            // try to find baseName by field
            if (this._modelNamespace[object.baseName].fields.hasOwnProperty(key)) {
              const fieldDef = this._modelNamespace[object.baseName].fields[key]
              value.baseName = fieldDef.type
            }
          }
          if (value.baseName) {
            // dig deeper
            value = this.__mapPropertiesToEdges(value)
          }
        }
        if (mapping !== false && mapping.hasOwnProperty(key)) {
          object[mapping[key]] = value
          delete object[key]
        }
      })
    }
  }

  __readPropertyToEdgemappings (baseName) {
    let mapping = {}
    let edgeMapping = {}
    this._modelNamespace[baseName].fieldsArray.forEach(fieldDefinition => {
      if (fieldDefinition.options && fieldDefinition.options['(dn).tags']) {
        const match = /db="([^"]+)"/.exec(fieldDefinition.options['(dn).tags'])
        if (match) {
          mapping[fieldDefinition.name] = match[1]
          edgeMapping[match[1]] = fieldDefinition.name
        }
      }
    })
    if (Object.keys(mapping).length > 0) {
      this.__propertyMappings[baseName] = mapping
      this.__edgeMappings[baseName] = edgeMapping
    } else {
      this.__propertyMappings[baseName] = false
      this.__edgeMappings[baseName] = false
    }
  }

  /**
   * Generates a Fragment that can be used in DB queries.
   * @param protoMessage {Object} proto definition
   * @param name {String} fragment name to use
   * @returns {string} fragment <name> { ...egdes }
   */
  getFragment (protoMessage, name) {
    let fragment = `fragment ${name} {`

    const prefix = this.__getPrefix(protoMessage)
    protoMessage.fieldsArray.forEach(fieldDef => {
      if (fieldDef.name === 'uid') {
        fragment += `
  uid`
      } else {
        fragment += `
  ${prefix}${fieldDef.name}`
      }
    })
    fragment += `
}`
    return fragment
  }

  /**
   * Returns a list of edge names used by the proto message.
   * @param type {String}
   * @returns {string[]}
   */
  getEdgeNames (type) {
    const protoMessage = proto.plugins[type].Payload
    const prefix = this.__getPrefix(protoMessage)
    let names = ['uid']
    protoMessage.fieldsArray.forEach(fieldDef => {
      if (fieldDef.name !== 'uid') {
        names.push(prefix + fieldDef.name)
      }
    })
    return names
  }

  /**
   * Generates a DGraph schema definition from a complete proto namespace
   * @param protoNamespace
   */
  getNamespaceSchemaDefinition (protoNamespace) {
    let schema = {}
    Object.keys(protoNamespace)
      .map(item => protoNamespace[item])
      .filter(item => item && item.constructor.className === 'Type')
      .forEach(protoMessage => {
        const fields = Object.keys(protoMessage.fields).filter(name => name !== 'uid')
        fields.forEach(fieldName => {
          const fieldDefinition = protoMessage.fields[fieldName]
          const tags = this.__getTags(fieldDefinition)
          tags.$$source = protoMessage.fullName
          const edgeName = tags.db ? tags.db : fieldName
          if (tags.type === undefined) {
            throw new SchemaMergeConflict('type required for edge: "' + edgeName + '", defined in ' + tags.$$source)
          }
          if (!schema.hasOwnProperty(edgeName)) {
            schema[edgeName] = tags
          } else {
            // check
            if (schema[edgeName].type !== tags.type) {
              throw new SchemaMergeConflict(
                'type mismatch for edge "' + edgeName + '". Defined in ' + schema[edgeName].$$source + ' as type "' + schema[edgeName].type + '" and in ' +
                tags.$$source + ' as type "' + tags.type + '"'
              )
            }
            if (schema[edgeName].index && schema[edgeName].index !== tags.index) {
              throw new SchemaMergeConflict(
                'index mismatch for edge "' + edgeName + '". Defined in ' + schema[edgeName].$$source + ' as "' + schema[edgeName].index + '" and in ' +
                tags.$$source + ' as "' + tags.index + '"'
              )
            }
            // merge (use true bool values to override)
            if (tags.reverse) {
              schema[edgeName].reverse = tags.reverse
            }
            if (tags.upsert) {
              schema[edgeName].upsert = tags.upsert
            }
          }
        })
      })
    let names = Object.keys(schema).sort()
    return names.map(name => {
      return `${name}: ${schema[name].type}${schema[name].index ? ' @index(' + schema[name].index + ')' : ''}${schema[name].reverse ? ' @reverse' : ''}${schema[name].upsert ? ' @upsert' : ''} .`
    }).join('\n')
  }

  /**
   * Extracts schema definitions (including indices) for a field in the proto message definition
   * @param protoMessage {Object} proto definition
   * @param fieldName {String?} if set: return schema definition only for this field, otherwise: return for all fields
   * @return {String} schema definition that can be used to alter the dgraph schema
   */
  getSchemaDefinition (protoMessage, fieldName) {
    const prefix = this.__getPrefix(protoMessage)
    const fields = fieldName ? [fieldName] : Object.keys(protoMessage.fields).filter(name => name !== 'uid')
    let schema = []
    fields.forEach(fieldName => {
      const fieldDefinition = protoMessage.fields[fieldName]
      let indexDefinition = ''
      const tags = this.__getTags(fieldDefinition)
      if (tags.index) {
        indexDefinition = ` @index(${tags.index})`
      }
      if (tags.reverse) {
        indexDefinition = ' @reverse'
      }
      if (tags.upsert) {
        indexDefinition = ' @upsert'
      }
      if (tags.db) {
        fieldName = tags.db
      }
      let index = `${fieldName}: ${tags.type}${indexDefinition} .`
      if (prefix) {
        index = prefix + index
      }
      schema.push(index)
    })

    return schema.join('\n')
  }

  __getTags (fieldDefinition) {
    let result = {
      type: this.__mapProtoTypesToDgraph(fieldDefinition.type)
    }
    if (fieldDefinition.options && fieldDefinition.options['(dn).tags']) {
      const tags = this.__parseTags(fieldDefinition.options['(dn).tags'])
      if (tags.hasOwnProperty('db') && tags.db) {
        result.db = tags.db
      }
      if (tags.hasOwnProperty('type') && tags.type) {
        result.type = tags.type
      }
      if (tags.hasOwnProperty('index') && tags.index) {
        result.index = tags.index
      }
      result.reverse = tags.hasOwnProperty('reverse') && tags.reverse === 'true'
      result.upsert = tags.hasOwnProperty('upsert') && tags.upsert === 'true'
    }
    if (fieldDefinition.repeated && result.type !== 'uid') {
      result.type = `[${result.type}]`
    }
    return result
  }

  __getPrefix (protoMessage) {
    const parent = protoMessage.parent
    if (parent.parent.name === 'plugins') {
      return parent.name + '.'
    }
    return ''
  }

  /**
   * Parse '(dn).tags' field option from a proto definition.
   * @param rawTags {String} tags entry
   * @return {Map} map with tag names as key and tag values as value
   * @private
   */
  __parseTags (rawTags) {
    let tags = {}
    let m
    while ((m = this.__tagRegex.exec(rawTags)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === this.__tagRegex.lastIndex) {
        this.__tagRegex.lastIndex++
      }
      tags[m[1].trim()] = m[2]
      m.index = 2
    }
    return tags
  }

  __mapProtoTypesToDgraph (protoType) {
    switch (protoType) {
      case 'string':
        return 'string'

      case 'int32':
      case 'int64':
      case 'uint32':
      case 'uint64':
      case 'sint32':
      case 'sint64':
      case 'fixed32':
      case 'fixed64':
      case 'sfixed32':
      case 'sfixed64':
        return 'int'

      case 'bool':
        return 'bool'
    }
  }
}

const protoProcessor = new ProtoProcessor()

class SchemaMergeConflict extends Error {}

module.exports = {
  protoProcessor: protoProcessor,
  SchemaMergeConflict: SchemaMergeConflict
}
