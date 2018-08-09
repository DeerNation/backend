#!/usr/bin/env node

const any = require('./any')
const proto = require('./protos')

const model = {
  type_url: 'app.hirschberg-sauerland.de/protos/app.plugins.message.Payload',
  value: {
    uid: '0x1',
    content: 'Test'
  }
}

const messageType = proto.plugins.message.Payload
model.value = messageType.encode(messageType.fromObject(model.value)).finish()

any.convertToModel(model)
console.log('From Proto: ', model)

any.convertFromModel(model)
console.log('From Model:', model)

console.log('Decoded:', messageType.toObject(messageType.decode(model.value)))