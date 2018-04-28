/**
 * Ggraph client
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const dgraph = require('dgraph-js')
const grpc = require('grpc')
const acl = require('../acl')
const config = require('../config')
const defaultData = require('./default-graph-data')
const logger = require('../logger')(__filename)

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
username: string @index(hash) @upsert .
password: password .
type: string @index(hash) .
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

class DgraphService {
//   async getSubscriptions (authToken, request) {
//     await acl.check(authToken, config.domain + '.object.Subscription', acl.action.READ)
//     const query = `query actor($a: string) {
//   actor(func: uid($a)) {
//     subscriptions : ~actor {
//       uid
//       channel {
//         uid
//         id
//         type
//         title
//         description
//         color
//         favorite
//       }
//     }
//   }
// }`
//     const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.uid})
//     const subscriptions = res.getJson().actor[0]['~actor']
//     subscriptions.forEach(sub => {
//       sub.channel = sub.channel[0]
//     })
//     console.log(subscriptions)
//     return subscriptions
//   }

  async getModel (authToken) {
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
        subscriptions : ~actor {
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
    }
    }`
    const res = await dgraphClient.newTxn().query(query)
    const model = res.getJson()

    // normalize model
    if (model.hasOwnProperty('me')) {
      model.me = model.me[0]
      model.me.subscriptions.forEach(sub => {
        sub.channel = sub.channel[0]
      })
    }
    return model
  }

  async getChannelModel (authToken, request) {
    console.log(authToken)
    const result = {
      channelActions: await acl.getAllowedActions(request.id),
      activityActions: await acl.getAllowedActions(request.id + '.activities')
    }
    console.log(request, result)
    if (result.activityActions.actions.includes('r')) {
      const query = `query channelModel($a: string) {
        channel(func: uid($a)) {
          publications : ~actor @filter(has(activity) AND has(published)) {
            uid
            activity {
             _predicate_
            }
            published
            master
          }
        }
    }`
      const res = await dgraphClient.newTxn().queryWithVars(query, {$a: request.id})
      result.publications = res.getJson().publications
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
}

const dgraphService = new DgraphService()

module.exports = {
  client: dgraphClient,
  dgraphService: dgraphService
}
