/**
 * Helper functions to convert google.protobuf.Any.
 * Used for activity content payloads defined by plugins.
 */
const proto = require('./protos')

const typeRegex = /^app.hirschberg-sauerland.de\/protos\/app\.plugins\.([a-z]+)\.Payload/

function getType (typeUrl) {
  const match = typeRegex.exec(typeUrl)
  if (match) {
    return match[1]
  }
  return null
}

module.exports = {
  TYPE_URL_TEMPLATE: 'app.hirschberg-sauerland.de/protos/app.plugins.$ID.Payload',
  
  /**
   * Convert Activity.Content (of type any) to be send to clients
   * (encodes the value)
   */
  convertToModel: function (content) {
    const type = getType(content.type_url)
    if (!type) {
      throw new Error('no type found for type_url: ' + content.type_url)
    }
    const messageType = proto.plugins[type].Payload
    content.value = messageType.encode(messageType.fromObject(content.value)).finish()
  },

  /**
   * Prepare Any content to be stored in database.
   * @param content
   */
  convertFromModel: function (content) {
    const type = getType(content.type_url)
    if (!type) {
      throw new Error('no type found for type_url: ' + content.type_url)
    }
    const messageType = proto.plugins[type].Payload
    content.value = messageType.toObject(messageType.decode(content.value))
  }
}