/**
 * CreateObject
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const config = require('../../config')
const i18n = require('i18n')
const {ResponseException} = require('../../exceptions')
const {hash} = require('../../util')
const channelHandler = require('../../ChannelHandler')
const any = require('../any')
const logger = require('../../logger')(__filename)

/**
 * Process pre update hook for new publications.
 * another channel)
 * @param authToken {Map}
 * @param publication {Map}
 */
function preUpdatePublication (authToken, publication) {
  if (!publication.activity || !publication.activity.content || !publication.activity.content.value) {
    throw new ResponseException(1, i18n.__('Updating a publication without content is not possible!'))
  }
  const content = publication.activity.content
  if (content) {
    const raw = content.value
    logger.debug('RAW:' + JSON.stringify(content.value, null, 2))
    publication.activity.content.value = any.convertToModel(content)
    publication.activity.hash = hash(raw)
    logger.debug('CONVERTED:' + JSON.stringify(publication.activity.content, null, 2))
  }

  // dump ExternalRef
  if (publication.activity.ref && publication.activity.ref.original) {
    publication.activity.ref.original = JSON.stringify(publication.activity.ref.original)
  }

  // remove empty strings from payload
  Object.keys(content).forEach(key => {
    if (content[key] === '') {
      delete content[key]
    }
  })
}

function postUpdatePublication (authToken, publication) {
  logger.debug('running post create publication hook')
  const content = Object.assign({}, publication.activity.content)
  if (publication.published) {
    publication.published = publication.published.toISOString()
  }
  if (publication.activity.created) {
    publication.activity.created = publication.activity.created.toISOString()
  }
  // parse JSON to let the notification handlers work with the content
  if (content) {
    publication.activity.content.value = JSON.parse(content.value)
  }

  // parse ExternalRef
  if (publication.activity.ref && publication.activity.ref.original) {
    publication.activity.ref.original = JSON.parse(publication.activity.ref.original)
  }

  // remove all baseNames
  recursiveRemoveProperty(publication, 'baseName')
}

function recursiveRemoveProperty (obj, prop) {
  if (obj.hasOwnProperty(prop)) {
    delete obj[prop]
  }
  Object.values(obj)
    .filter(val => !!val && typeof val === 'object')
    .forEach(child => {
      recursiveRemoveProperty(child, prop)
    })
}

module.exports = function (pre, authToken, type, object) {
  switch (type) {

    case 'publication':
      pre ? preUpdatePublication(authToken, object) : postUpdatePublication(authToken, object)
      break
  }
}
