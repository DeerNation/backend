/**
 * db
 *
 * @author tobiasb
 * @since 2018
 */

const schema = require('../model/schema')

function getChannels(data, cb) {
  cb(null, [{
    name: 'hbg.channel.news.public'
  }])
}

module.exports = {
  getChannels: getChannels
}
