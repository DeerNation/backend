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
     * @param hideIfEmpty {Boolean?} hide the childControl if the value is empty
     * @private
     */
    _bindPropertyToChildControl: function (model, propertyName, childControlName, childControlProperty, bindProperties, oldModel, hideIfEmpty) {
      let control = this.getChildControl(childControlName)
      if (oldModel) {
        oldModel.removeRelatedBindings(control)
      }
      if (hideIfEmpty) {
        if (bindProperties && bindProperties.converter) {
          const converter = bindProperties.converter
          bindProperties.converter = function (value) {
            if (!value) {
              control.exclude()
            } else {
              control.show()
            }
            return converter(value)
          }
        } else {
          if (!bindProperties) {
            bindProperties = {}
          }
          bindProperties.converter = function (value) {
            if (!value) {
              control.exclude()
            } else {
              control.show()
            }
            return value
          }
        }
      }
      model.bind(propertyName, control, childControlProperty, bindProperties)
    }
  }
})
