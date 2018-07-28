/**
 * protos
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const grpc = require('grpc')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const logger = require('../logger')(__filename)
const protoLoader = require('@grpc/proto-loader')
const config = require('../config')
const Protobuf = require('protobufjs')

function joinName(baseName, name) {
  if (baseName === '') {
    return name;
  }
  else {
    return baseName + '.' + name;
  }
}
function getAllTypes(obj, parentName) {
  var objName = joinName(parentName, obj.name);
  if (obj.nestedArray.length === 0) {
    return [[objName, obj]];
  }
  else {
    return obj.nestedArray.map(function (child) {
      if (child.hasOwnProperty('nested')) {
        return getAllTypes(child, objName);
      }
      else {
        return [];
      }
    }).reduce(function (accumulator, currentValue) { return accumulator.concat(currentValue); }, []);
  }
}

function createPackageDefinition(root, options) {
  var def = {};
  for (var _i = 0, _a = getAllTypes(root, ''); _i < _a.length; _i++) {
    var _b = _a[_i], name = _b[0], obj = _b[1];
    def[name] = obj;
  }
  return def;
}

function addIncludePathResolver (root, includePaths) {
  root.resolvePath = function (origin, target) {
    for (var _i = 0, includePaths_1 = includePaths; _i < includePaths_1.length; _i++) {
      var directory = includePaths_1[_i]
      var fullPath = path.join(directory, target)
      try {
        fs.accessSync(fullPath, fs.constants.R_OK)
        return fullPath
      }
      catch (err) {
        continue
      }
    }
    return null
  };
}

function loadSync (filename, options) {
  var root = new Protobuf.Root()
  options = options || {}
  if (!!options.includeDirs) {
    if (!(options.includeDirs instanceof Array)) {
      throw new Error('The include option must be an array')
    }
    addIncludePathResolver(root, options.includeDirs)
  }
  var loadedRoot = root.loadSync(filename, options)
  loadedRoot.resolveAll()
  return createPackageDefinition(loadedRoot)
}

const protoRoot = config.PROTOS_DIR
let packageDefinition = protoLoader.loadSync('api.proto',
  {
    includeDirs: [protoRoot]
  })
const proto = grpc.loadPackageDefinition(packageDefinition)
const pluginPath = config.PLUGINS_CONTENT_DIR

// load plugins
const files = glob.sync(pluginPath + '/**/*.proto')
files.forEach(protoPath => {
  if (protoPath.includes('/node_modules/')) {
    return
  }
  const pluginRoot = protoPath.substring(0, protoPath.indexOf('/', pluginPath.length + 1))
  packageDefinition = loadSync(protoPath.substring(pluginRoot.length + 1),
    {
      includeDirs: [protoRoot, pluginRoot]
    })

  Object.keys(packageDefinition).forEach(function (namespace) {
    const obj = packageDefinition[namespace]
    let parts = namespace.split('.')
    let pointer = proto
    let part = parts.shift()
    while (part) {
      if (!pointer.hasOwnProperty(part)) {
        pointer[part] = {}
      }
      pointer = pointer[part]
      part = parts.shift()
      if (parts.length === 0) {
        break
      }
    }
    pointer[part] = obj
  })
})

module.exports = proto
