/**
 * schema
 *
 * @author tobiasb
 * @since 2018
 */
const scCrudRethink = require('sc-crud-rethink')
const bcrypt = require('bcryptjs')
const logger = require('../logger')(__filename)
const {botUUID} = require('../util')
const i18n = require('i18n')

class Schema {
  constructor () {
    this.__crud = null
  }

  getModels () {
    return this.__crud.models
  }

  getModel (name) {
    return this.__crud.models[name]
  }

  getR () {
    return this.__crud.thinky.r
  }

  getCrud () {
    return this.__crud
  }

  create (worker, callback) {
    const thinky = scCrudRethink.thinky
    const type = thinky.type

    let crudOptions = {
      defaultPageSize: 5,
      schema: {
        Actor: {
          fields: {
            id: type.string(),
            name: type.string().min(3),
            type: type.string().enum('Person', 'Server', 'Bot'),
            role: type.string(),
            desc: type.string().optional(),
            email: type.string().email(),
            username: type.string(),
            password: type.string(),
            defaultNotification: type.object(),
            online: type.boolean(),
            status: type.string(),
            color: type.string(),
            locale: type.string().enum('de', 'en').default('de')
          },
          views: {
            alphabeticalView: {
              transform: function (fullTableQuery, r) {
                return fullTableQuery.orderBy(r.asc('name'))
              }
            }
          },
          filters: {
            pre: mustBeLoggedIn,
            post: function (req, next) {
              if (Array.isArray(req.resource)) {
                req.resource.forEach(actor => {
                  // never send the password
                  if (actor.password) {
                    actor.password = '***'
                  }
                })
              } else if (req.resource.password) {
                req.resource.password = '***'
              }
              next()
            }
          }
        },
        Firebase: {
          fields: {
            id: type.string(),
            token: type.string(),
            actorId: type.string(),
            created: type.date().default(new Date()),
            info: type.object()
          },
          filters: {
            pre: mustBeOwner
          }
        },
        Config: {
          fields: {
            actorId: type.string(),
            settings: type.object()
          },
          filters: {
            pre: mustBeOwner
          }
        },
        Webhook: {
          fields: {
            id: type.string(),
            name: type.string(),
            secret: type.string(),
            channel: type.string(),
            actorId: type.string()
          },
          filters: {
            pre: mustBeOwner
          }
        },

        Activity: {
          fields: {
            id: type.string(),
            type: type.string().enum('Message', 'Event').default('Message'),
            channelId: type.string(),
            content: type.object(),
            title: type.string(),
            created: type.date().default(new Date()),
            published: type.date(),
            actorId: type.string(),
            hash: type.string()
          },
          filters: {
            pre: mustBeLoggedIn
          },
          views: {
            fromChannel: {
              transform: function (fullTableQuery, r, options) {
                return fullTableQuery.filter(r.row('channelId').eq(options.channelId)).orderBy(r.asc('published'))
              }
            }
          }
        },

        Attachment: {
          fields: {
            id: type.string(),
            type: type.string(),
            blob: type.buffer()
          },
          filters: {
            pre: mustBeLoggedIn
          }
        },

        Channel: {
          fields: {
            id: type.string(),
            type: type.string().enum('PUBLIC', 'PRIVATE'),
            title: type.string(),
            description: type.string(),
            created: type.date().default(new Date()),
            ownerId: type.string(),
            color: type.string(),
            typeIcon: type.string(),
            view: type.string().enum('calendar', 'channel').default('channel')
          },
          views: {
            publicChannels: {
              affectingFields: ['type'],
              transform: function (fullTableQuery, r) {
                return fullTableQuery.filter(r.row('type').eq('PUBLIC'))
              }
            }
          },
          filters: {
            pre: mustBeLoggedIn
          }
        },

        Subscription: {
          fields: {
            id: type.string(),
            actorId: type.string(),
            channelId: type.string(),
            favorite: type.boolean().default(false),
            viewedUntil: type.date(),
            desktopNotification: type.object(),
            mobileNotification: type.object(),
            emailNotification: type.object()
          },
          views: {
            mySubscriptions: {
              paramFields: ['actorId', 'favorite'],
              affectingFields: ['actorId'],
              transform: function (fullTableQuery, r, subscriptionFields) {
                return fullTableQuery.filter(r.row('actorId').eq(subscriptionFields.actorId))
              }
            }
          },
          filters: {
            pre: mustBeOwner
          }
        },
        ACLEntry: {
          fields: {
            id: type.string(),
            type: type.string().enum('channel', 'rpc', 'channel-activity', 'generic', 'object'),
            topic: type.string(),
            actions: type.string(),
            memberActions: type.string(),
            ownerActions: type.string(),
            targetType: type.string().enum('role', 'actor', 'channel'),
            target: type.string()
          }
        },
        ACLRole: {
          fields: {
            id: type.string(),
            scope: type.string().enum('channel', 'actor'),
            members: type.array()
          }
        }
      },

      thinkyOptions: {
        host: process.env.DATABASE_HOST || '127.0.0.1',
        port: process.env.DATABASE_PORT || 28015
      }
    }

    function mustBeOwner (req, next) {
      if (!req.socket.getAuthToken()) {
        next(true)
      } else {
        let err
        switch (req.action) {
          case 'subscribe':
            if (req.query.viewParams &&
              // only allow queries of own ID
              (!req.query.viewParams.actorId ||
                req.query.viewParams.actorId !== req.socket.getAuthToken().user)) {
              err = new Error(i18n.__('You are not permitted to request this data.'))
              err.name = 'CRUDBlockedError'
              err.type = 'pre'
            }
            break

          case 'read':
          case 'delete':
          case 'update':
            if (req.socket.getAuthToken().user !== req.query.id) {
              if (req.action === 'read') {
                err = new Error(i18n.__('You are not permitted to read this data.'))
              } else if (req.action === 'delete') {
                err = new Error(i18n.__('You are not permitted to delete this data.'))
              } else {
                err = new Error(i18n.__('You are not permitted to update this data.'))
              }
              err.name = 'CRUDBlockedError'
              err.type = 'pre'
            }
            break
        }
        next(err)
      }
    }

    function mustBeLoggedIn (req, next) {
      if (req.socket.getAuthToken()) {
        next()
      } else {
        next(true)
        req.socket.emit('logout')
      }
    }

    // function postFilter (req, next) {
    //   // The post access control filters have access to the
    //   // resource object from the DB.
    //   // In case of read actions, you can even modify the
    //   // resource's properties before it gets sent back to the user.
    //   // console.log('r', !!req.r.table);
    //   // console.log('action', req.action);
    //   // console.log('socket', req.socket.id);
    //   // console.log('authToken', req.authToken);
    //   // console.log('query', req.query);
    //   // console.log('resource', req.resource);
    //   // console.log('-------');
    //   // if (req.resource.name == 'Foo') {
    //   //   var err = new Error('MAJOR FAIL');
    //   //   err.name = 'MajorFailError';
    //   //   next(err);
    //   //   return;
    //   // }
    //   next()
    // }

    let crud = scCrudRethink.attach(worker, crudOptions)
    if (worker.scServer) {
      worker.scServer.thinky = crud.thinky
    }
    const m = crudOptions.models

    // create indices
    m.Activity.ensureIndex('content.start')
    m.Firebase.ensureIndex('actorId')
    m.Firebase.ensureIndex('token')

    // create relations

    // n-n: An Activity can have many Attachments, an Attachment can belong to many Activities (e.g. shared attachments)
    m.Activity.hasAndBelongsToMany(m.Attachment, 'attachments', 'id', 'attachmentId')
    m.Attachment.hasAndBelongsToMany(m.Activity, 'event', 'attachmentId', 'id')

    // 1-n: An Activity can have only one creator (of type Actor), an Actor can be the creator of many Activities
    // m.Actor.hasMany(m.Event, 'createdEvents', 'id', 'creatorId')
    // m.Event.belongsTo(m.Actor, 'creator', 'creatorId', 'id')

    // 1-n: An webhook can have only one actor
    m.Actor.hasMany(m.Webhook, 'webhooks', 'id', 'actorId')
    m.Webhook.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-n: a Activity can only have one actor
    m.Actor.hasMany(m.Activity, 'activities', 'id', 'actorId')
    m.Activity.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-1: Actor<->Config relation
    m.Actor.hasOne(m.Config, 'config', 'id', 'actorId')
    m.Config.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-n: Firebase can oly have one actor
    m.Actor.hasMany(m.Firebase, 'firebase', 'id', 'actorId')
    m.Firebase.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-n: a Channel has exactly one owner
    m.Actor.hasMany(m.Channel, 'channels', 'id', 'ownerId')
    m.Channel.belongsTo(m.Actor, 'actor', 'ownerId', 'id')

    // 1-n: a Subscription has exactly one actor, actors can have multiple subscriptions
    m.Actor.hasMany(m.Subscription, 'subscriptions', 'id', 'actorId')
    m.Subscription.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-n: a Subscription has exactly one Channel, Channels can have multiple subscriptions
    m.Channel.hasMany(m.Subscription, 'subscriptions', 'id', 'channelId')
    m.Subscription.belongsTo(m.Channel, 'channel', 'channelId', 'id')

    // default Data
    let defaultData = {
      Actor: [{
        id: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
        type: 'Person',
        username: 'admin',
        role: 'admin',
        name: 'Tobias Bräutigam',
        email: 'tbraeutigam@gmail.com',
        password: bcrypt.hashSync('tester', 8),
        color: '#ACACAC',
        locale: 'de'
      }, {
        id: '135dd849-9cb6-466a-9a2b-688ae21b6cdf',
        type: 'Bot',
        username: 'hirschberg',
        role: 'bot',
        name: 'Hirschberg',
        email: 'tbraeutigam@gmail.com',
        password: bcrypt.hashSync(botUUID, 8),
        color: '#085525'
      }, {
        id: '39c83094-aaee-44bf-abc3-65281cc932dc',
        type: 'Person',
        username: 'user',
        role: 'user',
        name: 'Max Mustermann',
        email: 'tbraeutigam@gmail.com',
        password: bcrypt.hashSync('tester', 8),
        color: '#FFFF00',
        locale: 'de'
      }],
      Webhook: [
        {
          id: '5618e6a6-6d62-4689-8900-44b82b2a7523',
          channel: 'hbg.channel.news.public',
          secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
          name: 'News',
          actorId: '135dd849-9cb6-466a-9a2b-688ae21b6cdf'
        },
        {
          id: 'f1104eed-782c-4b0a-89d8-910cfa1de1c5',
          channel: 'hbg.channel.events.public',
          secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
          name: 'Termine',
          actorId: '135dd849-9cb6-466a-9a2b-688ae21b6cdf'
        }
      ],
      Channel: [
        {
          id: 'hbg.channel.news.public',
          type: 'PUBLIC',
          title: 'News',
          description: 'Alle Neuigkeiten aus Hirschberg',
          ownerId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
          color: '#085525'
        },
        {
          id: 'hbg.channel.events.public',
          type: 'PUBLIC',
          title: 'Termine',
          description: 'Termine & Veranstaltungen in Hirschberg',
          ownerId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
          color: '#CC5525',
          typeIcon: 'event',
          view: 'calendar'
        }
      ],
      Subscription: [
        {
          id: 'f2edfa36-c431-42f8-bc69-c0b060d941dc',
          actorId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
          channelId: 'hbg.channel.news.public',
          favorite: true,
          desktopNotification: {
            type: 'all'
          },
          mobileNotification: {
            type: 'mentioned'
          },
          emailNotification: {
            type: 'none'
          }
        },
        {
          id: '57ac49a7-2dc7-4997-8dbc-335f81cfad4b',
          actorId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
          channelId: 'hbg.channel.events.public',
          favorite: true,
          desktopNotification: {
            type: 'all'
          },
          mobileNotification: {
            type: 'mentioned'
          },
          emailNotification: {
            type: 'none'
          }
        }, {
          id: '55995e7e-e3e4-4af7-b766-dfd6a91a0ba8',
          actorId: '39c83094-aaee-44bf-abc3-65281cc932dc',
          channelId: 'hbg.channel.news.public',
          favorite: true,
          desktopNotification: {
            type: 'all'
          },
          mobileNotification: {
            type: 'mentioned'
          },
          emailNotification: {
            type: 'none'
          }
        }
      ],
      ACLRole: [
        {
          id: 'guest',
          weight: 0
        }, {
          id: 'user',
          parent: 'guest',
          members: ['39c83094-aaee-44bf-abc3-65281cc932dc'],
          weight: 100
        }, {
          id: 'admin',
          members: ['0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a'],
          weight: 1000
        }, {
          id: 'bot',
          weight: 100
        }
      ],
      ACLEntry: [
        {
          id: 'f357da38-c0b4-4071-afcf-1b33da16636b',
          topic: 'hbg\\.channel\\..+\\.public',
          actions: 'r',
          targetType: 'role',
          target: 'guest'
        },
        {
          id: 'c1ff521c-2633-4bac-9a55-344d9630cf06',
          topic: 'hbg\\.channel\\..+\\.public',
          actions: 'e',
          memberActions: 'lp',
          ownerActions: 'du',
          targetType: 'role',
          target: 'user'
        },
        {
          id: 'bbfb3075-633e-40bc-adf4-8d0a470dd954',
          topic: 'hbg\\.channel\\..+\\.private',
          memberActions: 'rlpf',
          ownerActions: 'ei',
          targetType: 'role',
          target: 'user'
        },
        {
          id: 'cda76f47-1061-4225-a079-c4552510db3b',
          topic: 'hbg\\.object\\..*',
          ownerActions: 'rud',
          targetType: 'role',
          target: 'user'
        },
        {
          id: '22c3ab14-dd93-414b-87c4-c0d0c9245cd6',
          topic: 'hbg\\.channel\\..+',
          actions: 'c',
          memberActions: 'rpl',
          ownerActions: 'ud',
          targetType: 'role',
          target: 'user'
        },
        {
          id: '755d7d16-fa30-424a-ac3f-4d7ac8f62fde',
          topic: 'hbg\\.channel\\..+',
          memberActions: 'p',
          targetType: 'role',
          target: 'bot'
        },
        {
          id: '3fa41d14-e3bf-4bb9-b221-f69e16e2f153',
          topic: 'hbg\\.rpc\\.(login|getAllowedActions|check|getChannels|getActors|getChannelActivities)',
          actions: 'x',
          targetType: 'role',
          target: 'guest'
        },
        {
          id: '08555f49-1738-4ddb-afda-4f3d1d33b6e6',
          topic: 'hbg\\.object\\.Actor',
          actions: 'r',
          targetType: 'role',
          target: 'guest'
        },
        {
          id: 'f894d70e-3aef-45ef-ac7b-53ea352f0869',
          topic: 'hbg\\.rpc\\..*',
          actions: 'x',
          targetType: 'role',
          target: 'user'
        },
        {
          id: '0e09cda6-fdca-4589-8929-3605943ba531',
          topic: 'hbg\\.object\\..*',
          actions: '',
          ownerActions: 'du',
          targetType: 'role',
          target: 'user'
        },
        {
          id: '2c55607a-9b52-4193-bead-1c1cb86f084a',
          topic: '$INT\\.users',
          actions: 'el',
          targetType: 'role',
          target: 'user'
        },
        {
          id: 'ca68d6d3-851a-4aa0-832d-d3077dd2e0e1',
          topic: 'crud>publicChannels.*',
          actions: 'rel',
          targetType: 'role',
          target: 'user'
        }
      ]
    }

    logger.debug('initializing database with default data')
    let promises = []
    Object.keys(defaultData).forEach(key => {
      promises.push(m[key].save(defaultData[key], {conflict: 'update'}).then(() => {
        logger.debug('%s default data applied', key)
      }).error(error => {
        logger.error('Error applying default data to %s:%s', key, error)
      }))
    })
    if (callback) {
      Promise.all(promises).then(() => {
        callback()
      })
    }
    this.__crud = crud
    return crud
  }
}

const schema = new Schema()

module.exports = schema
