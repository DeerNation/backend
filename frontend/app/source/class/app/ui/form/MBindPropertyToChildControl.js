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
