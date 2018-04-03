/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

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
      qx.core.Assert.assertNotNull(Clazz)
      return new Clazz(data)
    },

    /**
     * Create model instances for a data array
     * @param dataArray {Array}
     * @param Clazz {qx.Class?} use this class to create the object instance
     * @param delegate {Object} optional delegate with converter function for the manipulating the incoming data
     *                          and a modelConverter function for manipulating the generated object
     * @returns {qx.data.Array}
     */
    createAll: function (dataArray, Clazz, delegate) {
      qx.core.Assert.assertArray(dataArray)
      let instances = new qx.data.Array()
      delegate = delegate || {}
      dataArray.forEach(data => {
        if (delegate.converter) {
          delegate.converter(data)
        }
        const model = this.create(data, Clazz)
        if (delegate.modelConverter) {
          delegate.modelConverter(model)
        }
        instances.push(this.create(data, Clazz))
      })
      return instances
    }
  }
})
