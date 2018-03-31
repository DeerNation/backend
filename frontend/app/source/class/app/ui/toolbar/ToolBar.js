/**
 * Toolbar
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.ui.toolbar.ToolBar', {
  extend: qx.ui.toolbar.ToolBar,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (orientation) {
    this.base(arguments)
    if (orientation) {
      this.setOrientation(orientation)
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    orientation: {
      check: ['vertical', 'horizontal'],
      init: 'horizontal',
      apply: '_applyOrientation'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyOrientation: function (value) {
      switch (value) {
        case 'horizontal':
          this._setLayout(new qx.ui.layout.HBox(0, 'center'))
          this._getLayout().setAlignY('middle')
          break
        case 'vertical':
          this._setLayout(new qx.ui.layout.VBox())
          this._getLayout().setAlignX('center')
          break
      }
    },

    // overridden
    _applyShow: function(value) {
      const children = this._getChildren()
      for (let i = 0, l = children.length; i < l; i++) {
        console.log(children)
        if (children[i].setShow && !children[i].getUserData('showOverride')) {
          children[i].setShow(value)
        }
      }
    },

    /**
     * Add a widget to the toolbar if the current target matches {@see app.Config.target}
     * @param child {qx.ui.core.Widget}
     * @param child {LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     * @param targets {Array} only add the widget if one of this targets is set
     */
    addForTarget: function (child, options, targets) {
      if (!targets || targets.includes(app.Config.target)) {
        this.add(child, options)
      }
    }
  }
})
