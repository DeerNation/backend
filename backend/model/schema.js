/**
 * schema
 *
 * @author tobiasb
 * @since 2018
 */
const scCrudRethink = require('sc-crud-rethink');
const bcrypt = require('bcrypt')
const logger = require('../logger')(__filename)
const {botUUID} = require('../util')

class Schema {

  constructor() {
    this.__crud = null
  }

  getModels() {
    return this.__crud.models
  }

  getModel(name) {
    return this.__crud.models[name]
  }

  create(worker) {
    const thinky = scCrudRethink.thinky;
    const type = thinky.type;

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
            status: type.string()
          },
          views: {
            alphabeticalView: {
              transform: function (fullTableQuery, r) {
                return fullTableQuery.orderBy(r.asc('name'));
              }
            }
          },
          filters: {
            pre: mustBeLoggedIn
          }
        },
        Config: {
          fields: {
            actorId: type.string(),
            settings: type.object()
          },
          filters: {
            pre: mustBeLoggedIn
          }
        },
        Event: {
          fields: {
            id: type.string(),
            title: type.string(),
            content: type.string(),
            created: type.date().default(new Date()),
            published: type.date(),
            start: type.date(),
            end: type.date(),
            location: type.string().optional(),
            categories: type.array(),
            organizer: type.string().optional(),
            creatorId: type.string().optional(),
            hash: type.string()
          },
          views: {
            locationView: {
              // Declare the fields from the Product model which are required by the transform function.
              paramFields: ['location'],
              transform: function (fullTableQuery, r, productFields) {
                // Because we declared the category field above, it is available in here.
                // This allows us to transform/filter the Product collection based on a specific category
                // ID provided by the frontend.
                return fullTableQuery.filter(r.row('location').eq(productFields.location)).orderBy(r.desc('start'))
              }
            }
          },
          filters: {
            pre: mustBeLoggedIn,
            post: postFilter
          }
        },
        Attachment: {
          fields: {
            id: type.string(),
            type: type.string(),
            blob: type.buffer()
          }
        },
        Webhook: {
          fields: {
            id: type.string(),
            name: type.string(),
            secret: type.string(),
            channel: type.string(),
            actorId: type.string()
          }
        },

        Activity: {
          fields: {
            id: type.string(),
            channel: type.string(),
            title: type.string(),
            content: type.string(),
            created: type.date().default(new Date()),
            published: type.date(),
            actorId: type.string(),
            hash: type.string()
          }
        },

        Channel: {
          fields: {
            id: type.string(),
            type: type.string().enum('PUBLIC', 'PRIVATE'),
            title: type.string(),
            description: type.string(),
            created: type.date().default(new Date()),
            ownerId: type.string()
          }
        },

        Subscription: {
          fields: {
            id: type.string(),
            actorId: type.string(),
            channelId: type.string(),
            viewedUntil: type.date().default(new Date()),
            desktopNotification: type.object(),
            mobileNotification: type.object(),
            emailNotification: type.object()
          }
        }
      },

      thinkyOptions: {
        host: process.env.DATABASE_HOST || '172.17.0.2',
        port: process.env.DATABASE_PORT || 28015
      }
    };

    function mustBeLoggedIn(req, next) {
      if (req.socket.getAuthToken()) {
        next();
      } else {
        next(true);
        req.socket.emit('logout');
      }
    }

    function postFilter(req, next) {
      // The post access control filters have access to the
      // resource object from the DB.
      // In case of read actions, you can even modify the
      // resource's properties before it gets sent back to the user.
      // console.log('r', !!req.r.table);
      // console.log('action', req.action);
      // console.log('socket', req.socket.id);
      // console.log('authToken', req.authToken);
      // console.log('query', req.query);
      // console.log('resource', req.resource);
      // console.log('-------');
      // if (req.resource.name == 'Foo') {
      //   var err = new Error('MAJOR FAIL');
      //   err.name = 'MajorFailError';
      //   next(err);
      //   return;
      // }
      next();
    }

    let crud = scCrudRethink.attach(worker, crudOptions);
    worker.scServer.thinky = crud.thinky;
    const m = crudOptions.models

    // create indices
    m.Event.ensureIndex('start')

    // create relations

    // n-n: An Activity can have many Attachments, an Attachment can belong to many Activities (e.g. shared attachments)
    m.Event.hasAndBelongsToMany(m.Attachment, "attachments", "id", "attachmentId")
    m.Attachment.hasAndBelongsToMany(m.Event, "event", "attachmentId", "id")

    // 1-n: An Activity can have only one creator (of type Actor), an Actor can be the creator of many Activities
    m.Actor.hasMany(m.Event, "createdEvents", "id", "creatorId")
    m.Event.belongsTo(m.Actor, "creator", "creatorId", "id")

    // 1-n: An webhook can have only one actor
    m.Actor.hasMany(m.Webhook, "webhooks", "id", "actorId")
    m.Webhook.belongsTo(m.Actor, "actor", "actorId", "id")

    // 1-n: a Activity can only have one actor
    m.Actor.hasMany(m.Activity, "activities", "id", "actorId")
    m.Activity.belongsTo(m.Actor, "actor", "actorId", "id")

    // 1-1: Actor<->Config relation
    m.Actor.hasOne(m.Config, "config", "id", "actorId")
    m.Config.belongsTo(m.Actor, "actor", "actorId", "id")

    // 1-n: a Channel has exactly one owner
    m.Actor.hasMany(m.Channel, "channels", "id", "ownerId")
    m.Channel.belongsTo(m.Actor, "actor", "ownerId", "id")

    // 1-n: a Subscription has exactly one actor, actors can have multiple subscriptions
    m.Actor.hasMany(m.Subscription, "subscriptions", "id", "actorId")
    m.Subscription.belongsTo(m.Actor, "actor", "actorId", "id")

    // 1-n: a Subscription has exactly one Channel, Channels can have multiple subscriptions
    m.Channel.hasMany(m.Subscription, "subscriptions", "id", "channeld")
    m.Subscription.belongsTo(m.Channel, "channel", "channeld", "id")

    // default Data
    let defaultData = {
      Actor: [{
        id: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
        type: 'Person',
        username: 'admin',
        role: 'admin',
        name: 'Tobias Bräutigam',
        email: 'tbraeutigam@gmail.com',
        password: bcrypt.hashSync('tester', 8)
      },{
        id: '135dd849-9cb6-466a-9a2b-688ae21b6cdf',
        type: 'Bot',
        username: 'hirschberg',
        role: 'bot',
        name: 'Hirschberg',
        email: 'tbraeutigam@gmail.com',
        password: bcrypt.hashSync(botUUID, 8)
      }],
      Webhook: [
        {
          id: '5618e6a6-6d62-4689-8900-44b82b2a7523',
          channel: 'hbg.channel.news.public',
          secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
          name: 'News',
          actorId: '135dd849-9cb6-466a-9a2b-688ae21b6cdf'
        }
      ],
      Channel: [
        {
          id: 'hbg.channel.news.public',
          type: 'PUBLIC',
          title: 'News',
          description: 'Alle Neuigkeiten aus Hirschberg',
          ownerId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a'
        }
      ],
      Subscription: [
        {
          actorId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
          channelId: 'hbg.channel.news.public'
        }
      ]
    }

    logger.debug('initializing database with default data')
    Object.keys(defaultData).forEach(key => {
      m[key].save(defaultData[key], {conflict: 'update'}).then(result => {
        logger.debug('%s default data applied', key)
      }).error(error => {
        logger.error('Error applying default data to %s:%s', key, error)
      })
    })
    this.__crud = crud
    return crud
  }
}

const schema = new Schema()

module.exports = schema