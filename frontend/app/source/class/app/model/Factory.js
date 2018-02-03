/**
 * Factory
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.model.Factory', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    /**
     * Create an instance of a model class by its data
     * @param data
     */
    create: function (data, Clazz) {
      if (data.hasOwnProperty('__jsonclass__')) {
        Clazz = qx.Class.getByName(data['__jsonclass__'])
        if (!Clazz) {
          throw Error('Class ' + Clazz + ' not found')
        }
        delete data['__jsonclass__']
      }
      qx.core.Assert.assertNotNull(Clazz)
      return new Clazz(data)
    },

    /**
     * Create model instances for a data array
     * @param dataArray {Array}
     * @param Clazz {qx.Class?} use this class to create the object instance
     * @returns {qx.data.Array}
     */
    createAll: function (dataArray, Clazz) {
      qx.core.Assert.assertArray(dataArray)
      let instances = new qx.data.Array()
      dataArray.forEach(data => {
        instances.push(this.create(data, Clazz))
      })
      return instances
    }
  }
})
