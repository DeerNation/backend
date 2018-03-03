/**
 * Main
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.mobile.ui.Main', {
  extend: qx.ui.container.Stack,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._createChildControl('menu')
    this._createChildControl('channel')

    app.Model.getInstance().addListener('changedSelectedSubscription', this._onSelectedSubscription, this)
    this.setMaxWidth(qx.bom.Viewport.getWidth())
    this.__lid = qx.core.Init.getApplication().getRoot().addListener('resize', () => {
      this.setMaxWidth(qx.bom.Viewport.getWidth())
    })
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'main'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __lid: null,

    /**
     * Show Channel page on stack if subscription is selected, or the menu if not
     * @protected
     */
    _onSelectedSubscription: function (ev) {
      let newView = ev.getData() ? ev.getData().getChannel().getView() : null
      let oldView = ev.getOldData() ? ev.getOldData().getChannel().getView() : null
      if (oldView && oldView !== newView) {
        this.getChildControl(oldView).resetSubscription()
      }
      if (newView) {
        const control = this.getChildControl(newView)
        control.setSubscription(ev.getData())
        this.setSelection([control])
      } else {
        this.setSelection([this.getChildControl('menu')])
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'menu':
          control = new app.mobile.ui.Menu()
          this.add(control)
          break

        case 'channel':
          control = new app.ui.channel.Messages()
          this.add(control)
          break

        case 'calendar':
          control = new app.ui.channel.Events()
          this.add(control)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    app.Model.getInstance().removeListener('changedSelectedSubscription', this._onSelectedSubscription, this)
    if (this.__lid) {
      qx.core.Init.getApplication().getRoot().removeListenerById(this.__lid)
      this.__lid = null
    }
  }
})
