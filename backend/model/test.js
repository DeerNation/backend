#!/usr/bin/env node

const proto = require('./protos')
const {protoProcessor} = require('./ProtoProcessor')

const rawModel = {
  type_url: 'app.hirschberg-sauerland.de/protos/app.plugins.message.Payload',
  value: {
    uid: '0x1',
    content: 'Test'
  }
}
const model = Object.assign({}, rawModel)
const messageType = proto.plugins.message.Payload
model.value = messageType.encode(messageType.fromObject(rawModel.value)).finish()

const modelSchema = protoProcessor.getNamespaceSchemaDefinition(proto.dn.model.Activity.parent)
console.log('Schema definition for dn.model: ', modelSchema)

// const eventStartSchema = protoProcessor.getSchemaDefinition(proto.plugins.event.Payload)
// console.log('Schema definition for event->start: ', eventStartSchema)
//
// const eventFragment = protoProcessor.getFragment(proto.plugins.event.Payload, 'Event', 'event')
// console.log('Event Fragment:')
// console.log(eventFragment)
//
// let sourceModel = {
//   uid: '0x1',
//   start: new Date(),
//   end: new Date(),
//   name: 'test',
//   description: 'small test'
// }
//
// let anyModel = protoProcessor.anyToModel(rawModel)
// console.log('Any model: ', anyModel)
// let modelAny = protoProcessor.modelToAny(anyModel)
// console.log('model any: ', modelAny)
//
// let dbModel = protoProcessor.toDb(proto.plugins.event.Payload, sourceModel)
// console.log('DB model: ', dbModel)
// let protoModel = protoProcessor.fromDb(proto.plugins.event.Payload, dbModel)
// console.log('Proto model: ', protoModel)
//
// sourceModel = {
//   uid: '0x1',
//   content: 'some message content',
//   link: 'http://link.de'
// }
// dbModel = protoProcessor.toDb(proto.plugins.message.Payload, sourceModel)
// console.log('DB model: ', dbModel)
// protoModel = protoProcessor.fromDb(proto.plugins.message.Payload, dbModel)
// console.log('Proto model: ', protoModel)

// any.convertToModel(model)
// console.log('From Proto: ', model)
//
// any.convertFromModel(model)
// console.log('From Model:', model)
//
// console.log('Decoded:', messageType.toObject(messageType.decode(model.value)))
