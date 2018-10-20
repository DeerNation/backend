/**
 * Ggraph client
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const dgraph = require('dgraph-js')
const grpc = require('grpc')
const acl = require('../acl')
const proto = require('./protos')
const any = require('./any')
const i18n = require('i18n')
const defaultData = require('./default-graph-data')
const logger = require('../logger')(__filename)
const config = require('../config')
const globalSchema = require('./globalSchema')

const modelSubscriptions = require('./ModelSubscriptions')
const createHook = require('./hooks/CreateObject')
const updateHook = require('./hooks/UpdateObject')

const dgraphHost = (config.DGRAPH_HOST || 'localhost') + ':' + (config.DGRAPH_PORT || '9080')

logger.info('connecting to ' + dgraphHost)

const clientStub = new dgraph.DgraphClientStub(
  dgraphHost,
  grpc.credentials.createInsecure()
)

const dgraphClient = new dgraph.DgraphClient(clientStub)

// let environment = process.env.ENV || 'dev'
// if (environment === 'dev') {
//   dgraphClient.setDebugMode(true)
// }

async function setSchema (schema) {
  logger.debug('applying schema: ' + schema)
  const op = new dgraph.Operation()
  op.setSchema(schema)
  await dgraphClient.alter(op)
  logger.debug('DONE: applying schema')
}

async function fillDb () {
  await setSchema(globalSchema)

  // check if DB is empty
  const query = `{
    q(func: eq(baseName, "Actor")) {
      uid
    }
  }`
  const res = await dgraphClient.newTxn().query(query)
  const model = res.getJson()
  if (model.hasOwnProperty('q') && model.q.length > 0) {
    logger.debug('basic model already exists, bailing out to avoid duplicates')
    return
  }

  const names = Object.keys(defaultData)
  let jsonData = []
  for (let i = 0, l = names.length; i < l; i++) {
    let baseName = names[i]
    defaultData[baseName].map(x => {
      x.baseName = baseName
    })
    jsonData = jsonData.concat(defaultData[baseName])
  }

  if (jsonData.length === 0) {
    logger.debug('no data to store')
    return
  }

  dgraphClient.setDebugMode(true)
  // fill some data
  const txn = dgraphClient.newTxn()
  try {
    const mu = new dgraph.Mutation()
    logger.debug('saving default data')
    mu.setSetJson(jsonData)
    await txn.mutate(mu)
    await txn.commit()
  } catch (e) {
    console.log(e)
  } finally {
    await txn.discard()
    dgraphClient.setDebugMode(false)
  }
}

fillDb()

/**
 * dn.Com service implementation
 */
class DgraphService {
  async getModel (authToken, request, respond, options) {
    // TODO: remove listeners when the socket gets lost, the stream gets closed etc.
    let addQuery = ''
    if (authToken && authToken.user) {
      // query current actor + subscriptions too
      addQuery = `
      me(func: uid(${authToken.user})) {
        uid
        name
        username
        type
        role
        online
        status
        color
        subscriptions : ~actor @filter(eq(baseName, "Subscription")) {
          uid
          favorite
          viewedUntil
          channel {
            uid
            id
            type
            title
            description
            color
            favorite
            view
            allowedActivityTypes
            owner {
              uid
            }
          }
        }
      }
      `
    }
    let query = `{${addQuery}
    actors(func: eq(baseName, "Actor")) {
      uid
      name
      username
      type
      role
      online
      status
      color
    }
    publicChannels(func: eq(baseName, "Channel")) @filter(eq(type, "PUBLIC")) {
      uid
      id
      type
      title
      description
      color
      view
      allowedActivityTypes
      owner {
        uid
      }
    }
    }`
    const res = await dgraphClient.newTxn().query(query)
    const model = res.getJson()

    const processChange = function (change) {
      respond(change)
    }

    // normalize model
    if (model.hasOwnProperty('me')) {
      model.me = model.me[0]

      options.socket.on('close', () => {
        console.log(options.socket.id, 'closed')
        modelSubscriptions.removeListener(model.me.uid, processChange)
        modelSubscriptions.removeListener('subscription>actor[' + model.me.uid + ']', processChange)
      })
      // add listener
      modelSubscriptions.addListener(model.me.uid, processChange)
      // listen to actor -> subscription edge
      modelSubscriptions.addListener('subscription>actor[' + model.me.uid + ']', processChange)

      model.me.subscriptions.forEach(sub => {
        sub.channel = sub.channel[0]
        sub.channel.owner = sub.channel.owner[0]
        // TODO how to handle changes of channels referenced by subscriptions or subscriptions referenced by current user (subscription edge)
      })
      model.subscriptions = model.me.subscriptions
      delete model.me.subscriptions
    }
    model.publicChannels.forEach(chan => {
      chan.owner = chan.owner[0]
    })
    model.type = proto.dn.ChangeType.REPLACE
    return model
  }

  async getChannelModel (authToken, request) {
    if (!request.channelId || !request.uid) {
      throw new Error('invalid request')
    }
    const result = {}
    result.channelActions = await acl.getAllowedActions(authToken, request.channelId)
    result.activityActions = await acl.getAllowedActions(authToken, request.channelId + '.activities')
    let options = 'orderasc: published'
    let reverse = false
    if (request.limit) {
      options = 'orderdesc: published, first: ' + request.limit
      reverse = true
    }
    let filter = 'has(published)'
    if (request.date) {
      filter += ` AND ge(published, "${request.date}")`
    }

    if (result.activityActions.actions.includes('r')) {
      const query = `query channelModel($a: string) {
       channel(func: uid($a)) {
        id
        publications : ~channel (${options}) @filter(${filter}) {
          uid
          published
          master
          activity {
            uid
            hash
            created
            payload {
              expand(_all_)
            }
          }
          actor {
            uid
            username
            name
            color
          }
        }
      }
    }`
      const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.uid})
      if (res.getJson().channel[0].id !== request.channelId) {
        throw new Error('invalid request')
      }
      result.publications = res.getJson().channel[0].publications
      if (reverse && result.publications) {
        result.publications = result.publications.reverse()
      }
      // normalize data
      if (result.publications) {
        result.publications.forEach(pub => {
          pub.activity = pub.activity[0]
          delete pub.activity.actor
          delete pub.activity.baseName
          pub.actor = pub.actor[0]
          if (pub.activity.content) {
            pub.activity.content = pub.activity.content[0]
            pub.activity.content.value = any.convertFromModel(pub.activity.content)
          }
        })
      }
    }
    return result
  }

  async setFirebaseToken (authToken, request) {
    await acl.check(authToken, config.domain + '.object.firebase', acl.action.UPDATE, null, i18n.__('You are not allowed to save this token.'))

    const txn = dgraphClient.newTxn()
    let res, mu

    try {
      const query = `query read($a: string) {
          token(func: eq(tokenId, $a)) {
            uid
          }
        }`
      if (request.oldToken) {
        // delete old token
        res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.oldToken})
        const delJson = res.getJson().token.map(x => x.uid)
        mu = new dgraph.Mutation()
        mu.setDeleteJson(delJson)
        await txn.mutate(mu)
      }

      if (request.newToken) {
        res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.newToken})
        const existing = res.getJson().token.length > 0 ? res.getJson().token[0].uid : null
        mu = new dgraph.Mutation()
        if (existing) {
          mu.setSetJson({
            uid: existing,
            baseName: 'FirebaseToken',
            actor: {
              uid: authToken.user
            }
          })
          await txn.mutate(mu)
        } else {
          mu.setSetJson({
            uid: existing,
            tokenId: request.newToken,
            baseName: 'FirebaseToken',
            actor: {
              uid: authToken.user
            }
          })
        }
        await txn.mutate(mu)
        await txn.commit()
        return {
          code: 0
        }
      }
    } catch (e) {
      logger.error(e)
      return {
        code: 1,
        message: '' + e
      }
    } finally {
      await txn.discard()
    }
  }

  /**
   * Authenticate against dgraph
   * @param username {String}
   * @param password {String}
   * @returns {Promise<Boolean>}
   */
  async authenticate (username, password) {
    const query = `query login($a: string, $b: string) {
        loginAttemp(func: eq(username, $a)) {
            checkpwd(password, $b)
            uid
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: username, $b: password})
    const attemp = res.getJson().loginAttemp
    if (attemp.length === 1 && attemp[0].password.length === 1 && attemp[0].password[0].checkpwd === true) {
      return attemp[0].uid
    }
    return false
  }

  // --------------------------------------------------------------
  //  CRUD operations
  // --------------------------------------------------------------
  async getObject (authToken, request) {
    const query = `query read($a: string) {
        object(func: uid($a)) @recurse(depth: ${request.depth || 1}, loop: true) {
          uid
          expand(_all_)
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.uid})
    const object = res.getJson().object[0]
    if (!object) {
      return {}
    }
    if (authToken !== config.UUID) {
      // only check acl if this is not internal call
      await acl.check(authToken, config.domain + '.object.' + object.baseName, acl.action.READ)
    }
    const response = {content: object.baseName.toLowerCase()}

    // edge normalization
    Object.keys(object).forEach(edge => {
      if (request.depth >= 2 && edge.startsWith('~')) {
        // do not return reverse edges
        delete object[edge]
      } else if (Array.isArray(object[edge]) && object[edge].length === 1 && object[edge][0].hasOwnProperty('uid')) {
        object[edge] = object[edge][0]
        delete object[edge].baseName
      }
    })
    response[object.baseName.toLowerCase()] = object
    delete object.baseName
    return response
  }

  async __crudChecks (authToken, request, action, uidNeeded) {
    const type = request.content
    if (!type) {
      return {
        code: 1,
        message: 'no object type found in data'
      }
    }
    const object = request[type]
    if (uidNeeded === true && !object.uid) {
      return {
        code: 1,
        message: 'uid needed to identify the object'
      }
    } else if (uidNeeded === false && object.uid) {
      return {
        code: 1,
        message: 'the data must not contain an uid'
      }
    }
    try {
      await acl.check(authToken, config.domain + '.object.' + type.substring(0, 1).toUpperCase() + type.substring(1), action)
    } catch (e) {
      return {
        code: 2,
        message: e.toString()
      }
    }
    return true
  }

  async updateObject (authToken, request) {
    if (authToken !== config.UUID) {
      const checkResult = await this.__crudChecks(authToken, request, acl.action.UPDATE, true)
      if (checkResult !== true) {
        return checkResult
      }
    }
    const object = request[request.content]
    try {
      updateHook(true, authToken, request.content, object)
    } catch (e) {
      logger.error('Error applying pre UpdateObject hook: ' + e)
      return {
        code: e.code || 1,
        message: e.message
      }
    }
    logger.debug('updateObject: ' + JSON.stringify(object, null, 2))
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setSetJson(request[request.content])
      await txn.mutate(mu)
      await txn.commit()

      // apply post creation hooks
      try {
        updateHook(false, authToken, request.content, object)
      } catch (e) {
        txn.discard()
        logger.error('Error applying post UpdateObject hook: ' + e)
        return {
          code: e.code || 1,
          message: e.message
        }
      }

      modelSubscriptions.notifyListeners(this.__createChangeObject(request, proto.dn.ChangeType.UPDATE))
      return {
        code: 0,
        message: i18n.__('Object has been updated')
      }
    } catch (e) {
      logger.error(e)
      return {
        code: 1,
        message: '' + e.toString()
      }
    } finally {
      await txn.discard()
    }
  }

  async updateProperty (authToken, request) {
    // get object type from DB to be able to check ACLs
    const existing = await this.getObject(authToken, {uid: request.uid})

    if (authToken !== config.UUID) {
      if (!existing) {
        return {
          code: 1,
          message: i18n.__('Object not found')
        }
      }
      try {
        await acl.check(authToken, config.domain + '.object.' + existing.content.substring(0, 1).toUpperCase() + existing.content.substring(1), acl.action.UPDATE)
      } catch (e) {
        return {
          code: 2,
          message: e.toString()
        }
      }
    }
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      const change = {
        uid: request.uid
      }
      const update = {
        object: {
          type: proto.dn.ChangeType.UPDATE,
          content: existing.content
        }
      }
      console.log(request)
      const updateChange = Object.assign({}, change)
      if (request.object) {
        const object = request.object[request.object.content]
        request.names.forEach(name => {
          change[name] = object[name]
          updateChange[name] = object[name]
        })
        mu.setSetJson(change)
      } else {
        // delete property
        request.names.forEach(name => {
          change[name] = null
        })
        update.object.resetProperties = request.names
        mu.setDeleteJson(change)
      }
      await txn.mutate(mu)
      await txn.commit()
      update.object[existing.content] = updateChange
      modelSubscriptions.notifyListeners(update)
      return {
        code: 0
      }
    } catch (e) {
      logger.error(e)
      return {
        code: 1,
        message: '' + e
      }
    } finally {
      await txn.discard()
    }
  }

  /**
   * Creates a new object
   * @param authToken {Object}
   * @param request {Map} proto.dn.Object as map
   * @returns {Promise<*|boolean>}
   */
  async createObject (authToken, request) {
    if (authToken !== config.UUID) {
      const checkResult = await this.__crudChecks(authToken, request, acl.action.CREATE, false)
      if (checkResult !== true) {
        return checkResult
      }
    }
    const object = request[request.content]
    object.baseName = request.content.substring(0, 1).toUpperCase() + request.content.substring(1)
    // mark it to find the uid in the response
    object.uid = '_:' + request.content
    const uidMappers = {}
    uidMappers[request.content] = object

    // apply pre creation hooks
    try {
      createHook(true, authToken, request.content, object, uidMappers)
    } catch (e) {
      logger.error('Error applying pre CreateObject hook: ' + e)
      return {
        code: e.code || 1,
        message: e.message
      }
    }
    logger.debug('createObject: ' + JSON.stringify(object, null, 2))
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setSetJson(object)
      const res = await txn.mutate(mu)
      await txn.commit()

      // apply post creation hooks
      try {
        createHook(false, authToken, request.content, object, uidMappers)
      } catch (e) {
        txn.discard()
        logger.error('Error applying post CreateObject hook: ' + e)
        return {
          code: e.code || 1,
          message: e.message
        }
      }

      Object.keys(uidMappers).forEach(name => {
        uidMappers[name].uid = res.getUidsMap().get(name)
        const change = {
          type: proto.dn.ChangeType.ADD,
          object: {
            type: proto.dn.ChangeType.ADD,
            content: name
          }
        }
        change.object[name] = uidMappers[name]
        modelSubscriptions.notifyListeners(change)
      })
      return {
        code: 0,
        message: i18n.__('Object has been created')
      }
    } catch (e) {
      logger.error('Error creating object: ' + e)
      return {
        code: 1,
        message: '' + e
      }
    } finally {
      await txn.discard()
    }
  }

  /**
   * Create tha data structure for an proto.dn.Object instance
   * @param request {Object}
   * @param type {Number} of proto.dn.ChangeType
   * @returns {{object: {type: *, content: *}}}
   * @private
   */
  __createChangeObject (request, type) {
    const change = {
      object: {
        type: type,
        content: request.content
      }
    }
    change.object[request.content] = request[request.content]
    return change
  }

  async deleteObject (authToken, request) {
    const checkResult = await this.__crudChecks(authToken, request, acl.action.DELETE, true)
    if (checkResult !== true) {
      return checkResult
    }
    // read the complete object from DB to get the edges
    const deletedObject = await this.getObject(authToken, {uid: request[request.content].uid, depth: 2})
    console.log(deletedObject)
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setDeleteJson({uid: request[request.content].uid})
      await txn.mutate(mu)
      await txn.commit()
      const change = this.__createChangeObject(request, proto.dn.ChangeType.DELETE)
      // replace with complete object
      change.object[change.object.content] = deletedObject[deletedObject.content]
      console.log(JSON.stringify(change, null, 2))
      modelSubscriptions.notifyListeners(change)
      return {
        code: 0
      }
    } catch (e) {
      logger.error(e)
      return {
        code: 1,
        message: '' + e
      }
    } finally {
      await txn.discard()
    }
  }

  getAllowedActionsForRole (authToken, role, topic) {
    return acl.getAllowedActionsForRole(authToken, role, topic)
  }

  /**
   * Get UID for given username
   * @param username
   * @returns {Promise<*>}
   */
  async getActorUid (username) {
    const query = `query read($a: string) {
        object(func: eq(username, $a)) @filter(eq(baseName, "Actor")) {
          uid
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: username})
    return res.getJson().object[0].uid
  }
}

const dgraphService = new DgraphService()

module.exports = {
  dgraph: dgraph,
  dgraphClient: dgraphClient,
  dgraphService: dgraphService,
  setSchema: setSchema
}
