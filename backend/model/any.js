/**
 * Helper functions to convert google.protobuf.Any.
 * Used for activity content payloads defined by plugins.
 */
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
  convertFromModel: function (content) {
    content.value = Uint8Array.from(Object.values(JSON.parse(content.value)))
  },

  /**
   * Prepare Any content to be stored in database.
   * @param content
   */
  convertToModel: function (content) {
    content.value = JSON.stringify(content.value)
  },

  getType: getType
}