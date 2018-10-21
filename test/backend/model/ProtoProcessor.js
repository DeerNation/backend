/* eslint-env mocha */
const expect = require('chai').expect
const protoProcessor = require('../../backend/model/ProtoProcessor').protoProcessor

describe('ProtoProcessor tests', function () {
  it('should map properties to edge names recursively', async function () {
    let model = {
      baseName: 'Publication',
      uid: '0x1',
      actor: {
        uid: '0x2',
        baseName: 'Actor'
      },
      activity: {
        uid: '0x3',
        baseName: 'Activity',
        ref: {
          id: 'external'
        },
        payload: {
          baseName: 'payload.message',
          content: 'Message'
        }
      },
      channel: {
        uid: '0x4',
        type: 0,
        publications: []
      },
      published: new Date(),
      master: true
    }
    const modelKeys = Object.keys(model)
    protoProcessor.mapPropertiesToEdges(model)

    // no change in publication
    expect(Object.keys(model)).to.have.members(modelKeys)
    expect(model.channel.publication).to.exist()
    expect(model.channel.publication).to.be.an('array').that.is.empty()

  })
})
