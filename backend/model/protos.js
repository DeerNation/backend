/**
 * protos
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const grpc = require('grpc')
const path = require('path')
const proto = grpc.load({root: path.join(__dirname, '..', '..'), file: path.join('protos', 'api.proto')})

module.exports = proto
