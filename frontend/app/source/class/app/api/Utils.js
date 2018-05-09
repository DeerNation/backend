/**
 * Utils
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.api.Utils', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    objectFilter: function (obj, predicate) {
      return Object.keys(obj)
        .filter(key => predicate(key))
        .reduce((res, key) => {
          res[key] = obj[key]
          return res
        }, {})
    },

    serialize: function (object) {
      let skipProperties = ['deserialized', 'uid']
      qx.Class.getMixins(object.constructor).forEach((x) => {
        if (x.name.startsWith('app')) {
          const props = qx.util.PropertyUtil.getProperties(x)
          if (props) {
            skipProperties = skipProperties.concat(Object.keys(props))
          }
        }
      })
      const properties =
        app.api.Utils.objectFilter(qx.util.PropertyUtil.getProperties(object.constructor), x => !skipProperties.includes(x))

      const result = {}
      for (let name in properties) {
        // ignore property groups
        if (properties[name].group !== undefined) {
          continue
        }

        const value = object['get' + qx.lang.String.firstUp(name)]()
        if (qx.util.PropertyUtil.getInitValue(object, name) === value) {
          continue
        }
        if (qx.lang.Type.isArray(value) && value.length === 0) {
          continue
        }
        result[name] = qx.util.Serializer.toNativeObject(
          value, app.api.Utils.serialize
        )
      }
      return result
    }
  }
})
