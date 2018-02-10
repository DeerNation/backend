/**
 * MBindPropertyToChildControl
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Mixin.define('app.ui.form.MBindPropertyToChildControl', {
  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    /**
     * Binds a model property to a childcontrol property and optionally removes old bindings.
     *
     * @param model {qx.core.Object} source object to bind from
     * @param propertyName {String} property name to use from the model
     * @param childControlName {String} name of the childcontrol to bind to
     * @param childControlProperty {String} name of the childcontrol property (bind target)
     * @param bindProperties {Object?} optional bind properties
     * @param oldModel {qx.core.Object?} optional old model to remove bindings
     * @private
     */
    _bindPropertyToChildControl: function (model, propertyName, childControlName, childControlProperty, bindProperties, oldModel) {
      let control = this.getChildControl(childControlName)
      if (oldModel) {
        oldModel.removeRelatedBindings(control)
      }
      model.bind(propertyName, control, childControlProperty, bindProperties)
    }
  }
})
