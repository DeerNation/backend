/**
 * util
 *
 * @author tobiasb
 * @since 2018
 */
const uuidv4 = require('uuid/v4')
const XXHash = require('xxhash')

const botUUID = uuidv4()
module.exports.botUUID = botUUID

function normalizeActivity(activity) {
  let normalizedActivity = Object.assign({}, activity)
  delete normalizedActivity.channel
  if (normalizedActivity.hasOwnProperty('hash')) {
    delete normalizedActivity.hash
  }
  return JSON.stringify(normalizedActivity)
}

module.exports.hash = function(activity) {
  return XXHash.hash64(Buffer.from(normalizeActivity(activity), 'utf-8'), 0xCAFEBABE, 'hex')
}