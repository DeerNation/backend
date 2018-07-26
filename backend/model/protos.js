/**
 * protos
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const grpc = require('grpc')
const path = require('path')
const glob = require('glob')
const logger = require('../logger')(__filename)
const protoLoader = require('@grpc/proto-loader');

const protoRoot = process.env.DEERNATION_PROTOS_DIR.startsWith('/')
        ? process.env.DEERNATION_PROTOS_DIR
        : path.join(__dirname, process.env.DEERNATION_PROTOS_DIR)

let packageDefinition = protoLoader.loadSync('api.proto',
  {
    includeDirs: [protoRoot]
  });
const proto = grpc.loadPackageDefinition(packageDefinition)
const pluginPath = process.env.DEERNATION_PLUGINS_CONTENT_DIR.startsWith('/')
        ? process.env.DEERNATION_PLUGINS_CONTENT_DIR
        : path.join(__dirname, process.env.DEERNATION_PLUGINS_CONTENT_DIR)

// load plugins
const files = glob.sync(pluginPath + '/**/*.proto')
files.forEach(protoPath => {
  if (protoPath.includes('/node_modules/')) {
    return
  }
  const pluginRoot = protoPath.substring(0, protoPath.indexOf('/', pluginPath.length + 1))
  packageDefinition = protoLoader.loadSync(protoPath.substring(pluginRoot.length + 1), {includeDirs: [protoRoot, pluginRoot]});

  const pluginProto = grpc.loadPackageDefinition(packageDefinition)
  if (!pluginProto.dn) {
    logger.error('could not load package definition from ' + protoPath)
    return
  }
  if (!proto.dn.model) {
    proto.dn.model = {}
  }
  proto.dn.model.payload = Object.assign(proto.dn.model.payload || {}, pluginProto.dn.model.payload)

})

module.exports = proto
