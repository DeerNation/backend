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
 * Registry
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.model.activity.Registry', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.__registry = {}
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    DEFAULT_TYPE: 'message',
    __formInstances: {},

    // shortcut
    getRendererClass: function (type) {
      return this.getInstance().getRendererClass(type)
    },

    // shortcut
    getFormClass: function (type) {
      return this.getInstance().getFormClass(type)
    },

    getForm: function (type) {
      if (!this.__formInstances.hasOwnProperty(type)) {
        this.__formInstances[type] = new (this.getFormClass(type))()
      }
      return this.__formInstances[type]
    },

    // shortcut
    getModelClass: function (type) {
      return this.getInstance().getModelClass(type)
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __registry: null,

    register: function (type, modelClass, rendererClass, formClass) {
      qx.core.Assert.assertTrue(qx.Class.isSubClassOf(modelClass, app.model.activity.content.AbstractActivityContent))
      qx.core.Assert.assertInterface(formClass, qx.ui.form.IModel)
      qx.core.Assert.assertInterface(rendererClass, app.ui.renderer.IRenderer)
      this.__registry[type] = {
        modelClass: modelClass,
        rendererClass: rendererClass,
        formClass: formClass
      }
    },

    getModelClass: function (type) {
      type = type.toLowerCase()
      qx.core.Assert.assertKeyInMap(type, this.__registry)
      return this.__registry[type].modelClass
    },

    getRendererClass: function (type) {
      qx.core.Assert.assertKeyInMap(type, this.__registry)
      return this.__registry[type].rendererClass
    },

    getFormClass: function (type) {
      qx.core.Assert.assertKeyInMap(type, this.__registry)
      return this.__registry[type].formClass
    }
  }

})
