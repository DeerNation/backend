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
const proto = grpc.load({root: rootDir, file: path.join('protos', 'api.proto')})

const pluginPath = path.join(rootDir, 'plugins', 'content')

// load plugins
const files = glob.sync(pluginPath + '/**/*.proto')
files.forEach(protoPath => {
  const pluginProto = grpc.load({root: rootDir, file: protoPath.substring(rootDir.length)})
  proto.dn = Object.assign(proto.dn, pluginProto.dn)
})

module.exports = proto
