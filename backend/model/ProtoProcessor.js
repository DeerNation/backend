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
  }

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
      let type = this.__mapProtoTypesToDgraph(fieldDefinition.type)
      let indexDefinition = ''
      if (fieldDefinition.options && fieldDefinition.options['(dn).tags']) {
        const tags = this.__parseTags(fieldDefinition.options['(dn).tags'])
        if (tags.hasOwnProperty('type') && tags.type) {
          type = tags.type
        }
        if (tags.hasOwnProperty('index') && tags.index) {
          indexDefinition = ` @index(${tags.index})`
        }
      }
      let index = `${fieldName}: ${type}${indexDefinition} .`
      if (prefix) {
        index = prefix + index
      }
      schema.push(index)
    })

    return schema.join('\n')
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
        return 'int64'

      case 'bool':
        return 'bool'
    }
  }
}

const protoProcessor = new ProtoProcessor()

module.exports = {
  protoProcessor: protoProcessor
}
