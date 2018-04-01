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
    // shortcut
    getRendererClass: function (type) {
      return this.getInstance().getRendererClass(type)
    },

    // shortcut
    getFormClass: function (type) {
      return this.getInstance().getFormClass(type)
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
