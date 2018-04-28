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
    this.__mappings = ['name', 'start', 'end', 'organizer']
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
    __mappings: null,

    // overridden
    _initView: function () {
      this.__mappings.forEach(this._createChildControl, this)
      this.base(arguments)
    },

    // overridden
    _createContent: function () {
      const content = {}
      this.__mappings.forEach(name => {
        content[name] = this.getChildControl(name).getValue()
      })
      return content
    },

    // property apply
    _applyActivity: function (value, old) {
      if (old) {
        const oldEvent = old.getContent()
        this.__mappings.forEach(name => {
          oldEvent.removeRelatedBindings(this.getChildControl(name))
        })
      }
      if (value) {
        const event = value.getContent()
        this.__mappings.forEach(name => {
          event.bind(name, this.getChildControl(name), 'value')
        })
      } else {
        this.__mappings.forEach(name => {
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
