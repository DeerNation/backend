/**
 * ActivityItem
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.form.ActivityItem', {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IModel],
  include: app.ui.form.MBindPropertyToChildControl,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (label, icon, model) {
    this.base(arguments, label, icon, model)
    const layout = new qx.ui.layout.Grid()
    layout.setColumnFlex(1, 1)
    layout.setColumnAlign(0, 'left', 'top')
    layout.setColumnAlign(1, 'left', 'top')
    this._setLayout(layout)

    this.addListener('pointerover', this._onPointerOver, this)
    this.addListener('pointerout', this._onPointerOut, this)

    this.__dateFormat = new qx.util.format.DateFormat('H:m')

    this.setAuthorRoles(new qx.data.Array())

    // create child-controls in the right order
    this._createChildControl('author-icon')
    this._createChildControl('authorName')
    this._createChildControl('authorRoles')
    this._createChildControl('published')

    this.getContentElement().addClass('activity')
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events: {
    /** (Fired by {@link qx.ui.form.List}) */
    'action': 'qx.event.type.Event'
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    appearance: {
      refine: true,
      init: 'activity-listitem'
    },

    published: {
      check: 'Date',
      init: null,
      apply: '_applyPublished'
    },

    author: {
      check: 'app.model.Actor',
      init: null,
      apply: '_applyAuthor'
    },

    authorRoles: {
      check: 'qx.data.Array',
      init: null
    },

    model: {
      nullable: true,
      event: 'changeModel',
      apply: '_applyModel',
      dereference: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __dateFormat: null,
    _roleController: null,

    // apply method
    _applyModel: function (value, old) {
      if (old) {
        old.removeRelatedBindings(this)
      }
      if (value) {
        value.bind('published', this, 'published')
        value.bind('actor', this, 'author')
        const container = this.getChildControl('content-container')
        container.removeAll().forEach(entry => {
          entry.dispose()
        })
        const renderer = new (app.model.activity.Registry.getRendererClass(value.getType().toLowerCase()))()
        renderer.setModel(value)
        container.add(renderer)
      }
    },

    // property apply
    _applyPublished: function (value) {
      this.getChildControl('published').setValue(this.__dateFormat.format(value))
    },

    // property apply
    _applyAuthor: function (author, old) {
      this._bindPropertyToChildControl(author, 'name', 'author-icon', 'title', null, old)
      this._bindPropertyToChildControl(author, 'color', 'author-icon', 'backgroundColor', null, old)

      this._bindPropertyToChildControl(author, 'name', 'authorName', 'value', null, old)
      this._bindPropertyToChildControl(author, 'username', 'authorUsername', 'value', {
        converter: function (value) {
          return '@' + value
        }
      }, old)

      const roles = this.getAuthorRoles()
      roles.removeAll()
      if (app.Model.getInstance().getSelectedSubscription().getChannel().getOwnerId() === author.getId()) {
        roles.push(this.tr('Owner'))
      }
      if (author.getType() === 'Bot') {
        roles.push(this.tr('Bot').toUpperCase())
      } else if (author.getType() === 'Server') {
        roles.push(this.tr('Server'))
      } else {
        roles.unshift(author.getRole())
      }
      if (roles.getLength() > 0) {
        this.getChildControl('authorRoles').show()
      } else {
        this.getChildControl('authorRoles').exclude()
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control

      switch (id) {
        case 'author-icon':
          control = new app.ui.basic.AvatarIcon()
          control.setAnonymous(true)
          this._add(control, {row: 0, column: 0, rowSpan: 2})
          break

        case 'header':
          const layout = new qx.ui.layout.HBox()
          layout.setAlignY('middle')
          control = new qx.ui.container.Composite(layout)
          this._add(control, {row: 0, column: 1})
          break

        case 'authorName':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this.getChildControl('header').addAt(control, 1)
          break

        case 'authorRoles':
          control = new qx.ui.form.List(true)
          control.set({
            height: null,
            width: null,
            minHeight: null,
            minWidth: null,
            anonymous: true
          })
          this._roleController = new qx.data.controller.List(this.getAuthorRoles(), control, '')
          this._roleController.setDelegate({
            configureItem: function (item) {
              item.setAppearance('authorRole-listitem')
            }
          })
          this.getChildControl('header').addAt(control, 3)
          break

        case 'authorUsername':
          control = new qx.ui.basic.Label()
          control.setAnonymous(true)
          this.getChildControl('header').addAt(control, 2)
          break

        case 'published':
          control = new qx.ui.basic.Label(this.__dateFormat.format(this.getPublished()))
          control.setAnonymous(true)
          this.getChildControl('header').addAt(control, 4)
          break

        case 'content-container':
          control = new qx.ui.container.Composite(new qx.ui.layout.Grow())
          this._add(control, {row: 1, column: 1})
          break
      }
      return control || this.base(arguments, id, hash)
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      focused: true,
      hovered: true,
      selected: true,
      dragover: true
    },

    /**
     * Event handler for the pointer over event.
     */
    _onPointerOver: function () {
      this.addState('hovered')
    },

    /**
     * Event handler for the pointer out event.
     */
    _onPointerOut: function () {
      this.removeState('hovered')
    }
  },

  destruct: function () {
    this.removeListener('pointerover', this._onPointerOver, this)
    this.removeListener('pointerout', this._onPointerOut, this)
  }
})
