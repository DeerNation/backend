/**
 * Form to edit or create and Event activity
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.plugins.event.Form', {
  extend: app.plugins.AbstractContentForm,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'event-editor'
    },

    type: {
      refine: true,
      init: 'Event'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    // overridden
    _createContent: function () {
      return {
        name: this.getChildControl('name').getValue(),
        start: this.getChildControl('start').getValue()
      }
    },

    // property apply
    _applyActivity: function (value, old) {
      const mappings = ['name', 'start', 'end', 'organizer']
      if (old) {
        const oldEvent = old.getContentObject()
        mappings.forEach(name => {
          oldEvent.removeRelatedBindings(this.getChildControl(name))
        })
      }
      if (value) {
        const event = value.getContentObject()
        mappings.forEach(name => {
          event.bind(name, this.getChildControl(name), 'value')
        })
      } else {
        mappings.forEach(name => {
          this.getChildControl(name).resetValue()
        })
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'form':
          control = new qx.ui.form.Form()
          this._add(new qx.ui.form.renderer.Single(control), {flex: 1})
          break

        case 'name':
          control = new qx.ui.form.TextField()
          control.setRequired(true)
          this.getChildControl('form').add(control, this.tr('What'))
          break

        case 'organizer':
          control = new qx.ui.form.TextField()
          this.getChildControl('form').add(control, this.tr('Who'))
          break

        case 'start':
          control = new qx.ui.form.DateField()
          control.setRequired(true)
          this.getChildControl('form').add(control, this.tr('Start'))
          break

        case 'end':
          control = new qx.ui.form.DateField()
          this.getChildControl('form').add(control, this.tr('End'))
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
