/**
 * ActivityTypeSelector shows a list of activities the current user is allowed to create in a defined channel.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.ui.form.ActivityTypeSelector', {
  extend: qx.ui.core.Widget,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (channel) {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.Grow())
    this.setChannel(channel)
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    channel: {
      check: 'app.model.Channel',
      init: null
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    /**
     * Fill the list with the allowed activity types
     * @private
     */
    _fillList: function () {
      const channel = this.getChannel()
      const actor = app.Model.getInstance().getActor()
      const registry = app.model.activity.Registry.getInstance()
      const types = channel.getAllowedTypes() || registry.getTypes()

      // fill the list
      const list = this.getChildControl('list')
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'list':
          control = new qx.ui.form.List()
          this._add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
