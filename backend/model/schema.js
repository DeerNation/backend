/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * schema
 *
 * @author tobiasb
 * @since 2018
 */
const scCrudRethink = require('sc-crud-rethink')
const logger = require('../logger')(__filename)
const i18n = require('i18n')
const defaultData = require('./default-data')
const Migrator = require('./migrations')

class Schema {
  constructor () {
    this.__crud = null
    this.__contentTypes = []
    this._defaultContentType = null
  }

  registerContentType (name, isDefault) {
    if (!this.__contentTypes.includes(name)) {
      logger.debug('registering content type %s (default: %s)', name, !!isDefault)
      this.__contentTypes.push(name)
    }
    if (isDefault === true) {
      this._defaultContentType = name
    }
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

  getVersion () {
    return '0.1.0'
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
        System: {
          fields: {
            id: type.string(),
            key: type.string(),
            value: type.string()
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
            actorId: type.string(),
            type: type.string()
          },
          filters: {
            pre: mustBeOwner
          }
        },

        Activity: {
          fields: {
            id: type.string(),
            type: type.string().enum(this.__contentTypes).default(this._defaultContentType),
            content: type.object().allowExtra(true),
            title: type.string(),
            titleUrl: type.string(),
            created: type.date().default(new Date()),
            hash: type.string(),
            ref: type.string(),
            external: {
              type: type.string(),
              id: type.string(),
              original: type.object()
            }
          }
        },

        Publication: {
          fields: {
            id: type.string(),
            actorId: type.string(),
            channelId: type.string(),
            activityId: type.string(),
            published: type.date(),
            master: type.boolean()
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
            view: type.string().default('channel'),
            allowedActivityTypes: type.array()
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
    // m.Activity.ensureIndex('content.start')
    m.Firebase.ensureIndex('actorId')
    m.Firebase.ensureIndex('token')
    m.Publication.ensureIndex('channelId')

    // create relations

    // n-n: An Activity can have many Attachments, an Attachment can belong to many Activities (e.g. shared attachments)
    m.Activity.hasAndBelongsToMany(m.Attachment, 'attachments', 'id', 'attachmentId')
    m.Attachment.hasAndBelongsToMany(m.Activity, 'event', 'attachmentId', 'id')

    // 1-n: a Publication has only one activity
    m.Activity.hasMany(m.Publication, 'publications', 'id', 'activityId')
    m.Publication.belongsTo(m.Activity, 'activity', 'activityId', 'id')

    // 1-n: a Publication can only have one actor
    m.Actor.hasMany(m.Publication, 'publications', 'id', 'actorId')
    m.Publication.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-n: a Publication can only have one channel
    m.Channel.hasMany(m.Publication, 'publications', 'id', 'channelId')
    m.Publication.belongsTo(m.Channel, 'channel', 'channelId', 'id')

    // 1-n: An webhook can have only one actor
    m.Actor.hasMany(m.Webhook, 'webhooks', 'id', 'actorId')
    m.Webhook.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-1: Actor<->Config relation
    m.Actor.hasOne(m.Config, 'config', 'id', 'actorId')
    m.Config.belongsTo(m.Actor, 'actor', 'actorId', 'id')

    // 1-n: Firebase can only have one actor
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

    // run migration scripts
    const migrator = new Migrator(this)
    migrator.run()

    return crud
  }
}

const schema = new Schema()

module.exports = schema
