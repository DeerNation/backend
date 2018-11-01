/**
 * CreateObject
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const i18n = require('i18n')
const {ResponseException} = require('../../exceptions')
const {hash} = require('../../util')
const any = require('../any')
const logger = require('../../logger')(__filename)
const {protoProcessor} = require('../ProtoProcessor')

/**
 * Process pre update hook for new publications.
 * another channel)
 * @param authToken {Map}
 * @param publication {Map}
 */
function preUpdatePublication (authToken, publication) {
  if (!publication.activity || !publication.activity.payload || !publication.activity.payload.value) {
    throw new ResponseException(1, i18n.__('Updating a publication without content is not possible!'))
  }
  const content = publication.activity.payload
  if (content) {
    const raw = content.value
    logger.debug('RAW:' + JSON.stringify(content.value, null, 2))
    publication.activity.payload.value = any.convertToModel(content)
    publication.activity.hash = hash(raw)
    logger.debug('CONVERTED:' + JSON.stringify(publication.activity.payload, null, 2))

    // prepare content model to DB-model by mapping type_url to baseName and converting the model
    publication.activity.payload = protoProcessor.anyToModel(publication.activity.payload)
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
  logger.debug('running post update publication hook')
  if (publication.published) {
    publication.published = publication.published.toISOString()
  }
  if (publication.activity.created) {
    publication.activity.created = publication.activity.created.toISOString()
  }

  if (publication.activity.payload) {
    // convert DB model content to one that can be processed by a proto message
    publication.activity.payload = protoProcessor.modelToAny(publication.activity.payload)
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
