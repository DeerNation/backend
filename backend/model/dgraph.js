/**
 * Ggraph client
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const dgraph = require('dgraph-js')
const grpc = require('grpc')
const path = require('path')
const acl = require('../acl')
const defaultData = require('./default-graph-data')
const logger = require('../logger')(__filename)
const config = require('../config')
const protos = grpc.load({root: path.join(__dirname, '..', '..'), file: path.join('protos', 'api.proto')})

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
  const schema = `id: string @index(hash) .
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
  constructor () {
    this._listeners = {}
  }

  /**
   * Add listener to changes for the given UID
   * @param uid {String}
   * @param callback {Function}
   * @param context {Object?}
   */
  addListener (uid, callback, context) {
    if (!this._listeners.hasOwnProperty(uid)) {
      this._listeners[uid] = []
    }
    this._listeners[uid] = [callback, context]
  }

  /**
   * Remove listener to changes for the given UID
   * @param uid {String}
   * @param callback {Function}
   * @param context {Object?}
   */
  removeListener (uid, callback, context) {
    if (this._listeners.hasOwnProperty(uid)) {
      let removeAt = -1
      this._listeners[uid].some((entry, index) => {
        if (entry[0] === callback && entry[1] === (context || this)) {
          removeAt = index
          return true
        }
      })
      if (removeAt >= 0) {
        this._listeners[uid].splice(removeAt, 1)
      }
    }
  }

  /**
   * Remove all listeners for changes on the UID
   * @param uid {String\
   */
  removeAllListeners (uid) {
    delete this._listeners[uid]
  }

  /**
   * Notify listeners about a change for the UID
   * @param uid {String}
   * @param change {Map} change data
   */
  notifyListeners (uid, change) {
    if (this._listeners.hasOwnProperty(uid)) {
      this._listeners[uid].forEach(entry => {
        entry[0].call(entry[1], change)
      })
    }
  }

  async getModel (authToken, request, respond) {
    console.log(this)
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

    // normalize model
    if (model.hasOwnProperty('me')) {
      model.me = model.me[0]

      // add listener
      this.addListener(model.me.uid, respond)

      model.me.subscriptions.forEach(sub => {
        sub.channel = sub.channel[0]
        sub.channel.owner = sub.channel.owner[0]

        // add listener
        this.addListener(sub.uid, respond)

        // TODO how to handle changes of channels referenced by subscriptions or subscriptions referenced by current user (subscription edge)
      })
      model.subscriptions = model.me.subscriptions
      delete model.me.subscriptions
    }
    model.publicChannels.forEach(chan => {
      chan.owner = chan.owner[0]
      // add listener
      this.addListener(chan.uid, respond)
    })
    model.type = protos.dn.ChangeType.REPLACE
    return model
  }

  async getChannelModel (authToken, request) {
    const result = {}
    result.channelActions = await acl.getAllowedActions(authToken, request.channelId)
    result.activityActions = await acl.getAllowedActions(authToken, request.channelId + '.activities')

    if (result.activityActions.actions.includes('r')) {
      const query = `query channelModel($a: string) {
       channel(func: uid($a)) {
        publications : ~channel (orderasc: published) @filter(has(published)) {
          uid
          published
          master
          activity {
            uid
            hash
            created
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
      const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.uid})
      result.publications = res.getJson().channel[0].publications
      // normalize data
      result.publications.forEach(pub => {
        pub.activity = pub.activity[0]
        pub.actor = pub.actor[0]
        if (pub.activity.event) {
          pub.activity.event = pub.activity.event[0]
        } else if (pub.activity.message) {
          pub.activity.message = pub.activity.message[0]
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
  async readObject (authToken, request) {
    const query = `query read($a: string) {
        object(func: uid($a)) {
            expand(_all_)
        }
    }`
    const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.uid})
    const object = res.getJson().object[0]
    if (!object) {
      return {}
    }
    const response = {}
    await acl.check(authToken, config.domain + '.object.' + object.baseName, acl.action.READ)
    response[object.baseName.toLowerCase()] = object
    delete object.baseName
    return response
  }

  async __crudChecks (authToken, request, action, uidNeeded) {
    if (uidNeeded === true && !request.content.uid) {
      return {
        code: 1,
        message: 'uid needed to identify the object'
      }
    } else if (uidNeeded === false && request.content.uid) {
      return {
        code: 1,
        message: 'the data must not contain an uid'
      }
    }
    let type = ''
    Object.keys(request).some(prop => {
      if (prop !== 'content') {
        type = prop
        return true
      }
    })
    if (!type) {
      return {
        code: 1,
        message: 'no object type found in data'
      }
    }
    try {
      await acl.check(authToken, config.domain + '.object.' + type.substring(0, 1).toUpperCase() + type.substring(1), action)
    } catch (e) {
      return {
        code: 2,
        message: '' + e
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
      mu.setSetJson(request.content)
      await txn.mutate(mu)
      await txn.commit()
      this.notifyListeners(request.content.uid, {
        object: request.content
      })
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

  async createObject (authToken, request) {
    const checkResult = this.__crudChecks(authToken, request, acl.action.CREATE, false)
    if (checkResult !== true) {
      return checkResult
    }
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setSetJson(request.content)
      await txn.mutate(mu)
      await txn.commit()
      this.notifyListeners(request.content.uid, {
        object: request.content
      })
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

  async deleteObject (authToken, request) {
    const checkResult = this.__crudChecks(authToken, request, acl.action.DELETE, true)
    if (checkResult !== true) {
      return checkResult
    }
    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      mu.setDeleteJson(request.content)
      await txn.mutate(mu)
      await txn.commit()
      this.notifyListeners(request.content.uid, {
        object: request.content
      })
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
