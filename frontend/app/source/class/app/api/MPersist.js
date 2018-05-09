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
        const obj = new proto.dn.Object()
        const newThis = new this.constructor()
        newThis.set(name, value)
        obj.setOneOfContent(newThis)
        app.api.Service.getInstance().updateProperty(new proto.dn.PropertyUpdate({
          uid: this.getUid(),
          name: name,
          object: obj
        })).catch(app.Error.show)
      } else if (oldValue !== undefined) {
        // reset property
        app.api.Service.getInstance().updateProperty(new proto.dn.PropertyUpdate({
          uid: this.getUid(),
          name: name
        })).catch(app.Error.show)
      }
    }
  }
})
