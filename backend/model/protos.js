/**
 * protos
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const grpc = require('grpc')
const path = require('path')
const glob = require('glob')
const rootDir = path.join(__dirname, '..', '..')
const proto = grpc.loadPackageDefinition({root: rootDir, file: path.join('protos', 'api.proto')})

const pluginPath = path.join(rootDir, 'plugins', 'content')

// load plugins
const files = glob.sync(pluginPath + '/**/*.proto')
files.forEach(protoPath => {
  const pluginProto = grpc.loadPackageDefinition({root: rootDir, file: protoPath.substring(rootDir.length)})
  if (!proto.dn.model.payload) {
    proto.dn.model.payload = {}
  }
  proto.dn.model.payload = Object.assign(proto.dn.model.payload, pluginProto.dn.model.payload)

})

module.exports = proto
