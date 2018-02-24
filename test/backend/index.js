/* eslint-env mocha */

/**
 * setup backend test environment
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const sinon = require('sinon')
const thinky = require('thinky')
const scCrudRethink = require('sc-crud-rethink')
const schema = require('../../backend/model/schema')

class FakeCrudRethink {
  constructor (worker, options) {
    this.thinky = thinky(options.thinkyOptions)
    options.thinky = this.thinky
    this.models = {}
    Object.keys(options.schema).forEach((modelName) => {
      const modelSchema = options.schema[modelName]
      this.models[modelName] = this.thinky.createModel(modelName, modelSchema.fields)
    })
    options.models = this.models
  }
}

before(function (done) {
  // runs before all tests
  const mockedWorker = {}
  const mockedAttach = sinon.stub(scCrudRethink, 'attach')
  mockedAttach.callsFake((worker, options) => {
    return new FakeCrudRethink(worker, options)
  })
  schema.create(mockedWorker, done)
})

after(function () {
  schema.getR().getPool().drain()
})
