/**
 * db
 *
 * @author tobiasb
 * @since 2018
 */

const schema = require('../model/schema')

function getSubscriptions (authToken) {
  return schema.getModel('Subscription').filter({actorId: authToken.user}).run()
}

/**
 * Return all channels the current user has read access to
 * @param authToken
 */
function getChannels (authToken) {
  // TODO: we need ACLs for a finer grained access level definition
  return schema.getModel('Channel').filter({type: 'PUBLIC'}).run()
}

function getChannelActivities (authToken, channel, from) {
  const r = schema.getR()
  let filter = r.row('channel').eq(channel).and(r.row.hasFields('actorId'))
  if (from) {
    filter.and(r.row('published').ge(from))
  }
  return schema.getModel('Activity').filter(filter).orderBy(r.asc('published')).run()
}

function getActors (authToken) {
  return schema.getModel('Actor').pluck('id', 'name', 'username', 'type', 'role', 'online', 'status').run()
}

module.exports = {
  getChannels: getChannels,
  getSubscriptions: getSubscriptions,
  getChannelActivities: getChannelActivities,
  getActors: getActors
}
