const awilix = require('awilix')
// const Lifetime = awilix.Lifetime
const logger = require('./logger')
const any = require('./model/any')
const i18n = require('i18n')

// Create the container and set the injectionMode to PROXY (which is also the default).
const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
})

container.register({
  logger: awilix.asValue(logger),
  any: awilix.asValue(any),
  i18n: awilix.asValue(i18n)
})

module.exports = container
