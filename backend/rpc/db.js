/**
 * db
 *
 * @author tobiasb
 * @since 2018
 */

const schema = require('../model/schema')

function getChannels(authToken) {
  return schema.getModel('Subscription').filter({actorId: authToken.user}).run()
}

function getChannelActivities(authToken, channel, from) {
  const r = schema.getR()
  let filter = r.row('channel').eq(channel)
  if (from) {
    filter.and(r.row('published').ge(from))
  }
  return schema.getModel('Activity').filter(filter).orderBy(r.asc('published')).run()
}

module.exports = {
  getChannels: getChannels,
  getChannelActivities: getChannelActivities
}
