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
const i18n = require('i18n')
const defaultData = require('./default-graph-data')
const logger = require('../logger')(__filename)
const config = require('../config')

const modelSubscriptions = require('./ModelSubscriptions')
const createHook = require('./hooks/CreateObject')

const clientStub = new dgraph.DgraphClientStub(
  'localhost:9080',
  grpc.credentials.createInsecure()
)

const dgraphClient = new dgraph.DgraphClient(clientStub)

// let environment = process.env.ENV || 'dev'
// if (environment === 'dev') {
//   dgraphClient.setDebugMode(true)
// }

async function setSchema () {
  logger.debug('applying schema')
  const schema = `id: string @index(hash) @upsert .
baseName: string @index(exact) .  
actor: uid @reverse .
roleTarget: uid @reverse .
channel: uid @reverse .
username: string @index(hash) @upsert .
password: password .
type: string @index(hash) .
created: datetime .
published: datetime .
`
  const op = new dgraph.Operation()
  op.setSchema(schema)
  await dgraphClient.alter(op)
}

async function fillDb () {
  await setSchema()

  const names = Object.keys(defaultData)
  for (let i = 0, l = names.length; i < l; i++) {
    let baseName = names[i]
    defaultData[baseName].map(x => {
      x.baseName = baseName
    })

    // fill some data
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      logger.debug('saving ' + baseName)
      mu.setSetJson(defaultData[baseName])
      await txn.mutate(mu)
      await txn.commit()
    } catch (e) {
      console.log(e)
      break
    } finally {
      await txn.discard()
    }
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
        subscriptions : ~actor @filter(has(favorite)) {
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
            content {
              uid
              expand(_all_)
            }
            event {
              uid
              expand(_all_)
            }
            message {
              uid
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
      console.log(request.uid, query)
      const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.uid})
      if (res.getJson().channel[0].id !== request.channelId) {
        throw new Error('invalid request')
      }
      result.publications = res.getJson().channel[0].publications
      if (reverse) {
        result.publications = result.publications.reverse()
      }
      // normalize data
      result.publications.forEach(pub => {
        pub.activity = pub.activity[0]
        delete pub.activity.actor
        delete pub.activity.baseName
        pub.actor = pub.actor[0]
        if (pub.activity.event) {
          pub.activity.content = {
            type_url: 'app.hirschberg-sauerland.de/protos/dn.model.payload.Event',
            value: proto.dn.model.payload.Event.encode(pub.activity.event[0])
          }
          delete pub.activity.event
        } else if (pub.activity.message) {
          pub.activity.content = {
            type_url: 'app.hirschberg-sauerland.de/protos/dn.model.payload.Message',
            value: proto.dn.model.payload.Message.encode(pub.activity.message[0])
          }
          delete pub.activity.message
        } else if (pub.activity.content) {
          pub.activity.content = {
            type_url: 'app.hirschberg-sauerland.de/protos/dn.model.payload.' + pub.activity.content[0].baseName,
            value: proto.dn.model.payload[pub.activity.content[0].baseName].encode(pub.activity.content[0])
          }
          delete pub.activity.content.value.baseName
        }
      })
    }
    return result
  }

  setFirebaseToken (authToken, request) {

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
    const checkResult = this.__crudChecks(authToken, request, acl.action.UPDATE, true)
    if (checkResult !== true) {
      return checkResult
    }
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setSetJson(request[request.content])
      await txn.mutate(mu)
      await txn.commit()
      modelSubscriptions.notifyListeners(this.__createChangeObject(request, proto.dn.ChangeType.UPDATE))
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
    const checkResult = await this.__crudChecks(authToken, request, acl.action.CREATE, false)
    if (checkResult !== true) {
      return checkResult
    }
    const object = request[request.content]
    logger.debug(JSON.stringify(object, null, 2))
    object.baseName = request.content.substring(0, 1).toUpperCase() + request.content.substring(1)
    // mark it to find the uid in the response
    object.uid = '_:' + request.content
    const uidMappers = {}
    uidMappers[request.content] = object

    // apply pre creation hooks
    try {
      createHook(true, authToken, request.content, object, uidMappers)
    } catch (e) {
      return {
        code: e.code || 1,
        message: e.message
      }
    }
    logger.debug(JSON.stringify(object, null, 2))
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
        return {
          code: e.code || 1,
          message: e.message
        }
      }

      Object.keys(uidMappers).forEach(name => {
        uidMappers[name].uid = res.getUidsMap().get(name)
        const change = {
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
}

const dgraphService = new DgraphService()

module.exports = {
  client: dgraphClient,
  dgraphService: dgraphService
}
