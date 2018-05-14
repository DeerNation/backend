/**
 * MPersist mixin adds automatic backend persistence feature for properties with 'perstist' annotation.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Mixin.define('app.api.MPersist', {
  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.addListenerOnce('changeUid', () => {
      qx.Annotation.getPropertiesByAnnotation(this.constructor, 'persist').forEach(propName => {
        const propDef = qx.Class.getPropertyDefinition(this.constructor, propName)
        if (propDef.event) {
          this.addListener(propDef.event, this.__onPropertyChange.bind(this, propName), this)
        }
      })
    })
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __onPropertyChange: function (name, ev) {
      if (this.$$deserializing) {
        return
      }
      const value = ev.getData()
      const oldValue = ev.getOldData()
      if (value !== qx.util.PropertyUtil.getInitValue(this, name)) {
        app.api.Service.updateProperty(this.getUid(), [name], [value], this.constructor)
      } else if (oldValue !== undefined) {
        // reset property
        app.api.Service.updateProperty(this.getUid(), [name])
      }
    }
  }
})
