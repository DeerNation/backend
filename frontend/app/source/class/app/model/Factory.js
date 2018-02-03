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
    create: function (data) {
      let clazz = null
      if (data.hasOwnProperty('__jsonclass__')) {
        clazz = qx.Class.getByName(data['__jsonclass__'])
        if (!clazz) {
          throw Error('Class ' + clazz + ' not found')
        }
        delete data['__jsonclass__']
      }
      if (!clazz) {
        clazz = app.model.Activity
      }
      return new clazz(data)
    },

    /**
     * Create model instances for a data array
     * @param dataArray {Array}
     * @returns {Array}
     */
    createAll: function (dataArray) {
      qx.core.Assert.assertArray(dataArray)
      let instances = []
      dataArray.forEach(data => {
        instances.push(this.create(data))
      })
      return instances
    }
  }
})
