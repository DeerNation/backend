/**
 * schema
 *
 * @author tobiasb
 * @since 2018
 */
const scCrudRethink = require('sc-crud-rethink');

module.exports.create = function(scServer) {
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
          desc: type.string().optional(),
          email: type.string().email(),
          username: type.string(),
          password: type.string()
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
          creatorId: type.string().optional()
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

  let crud = scCrudRethink.attach(this, crudOptions);
  scServer.thinky = crud.thinky;
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

  return crud
}