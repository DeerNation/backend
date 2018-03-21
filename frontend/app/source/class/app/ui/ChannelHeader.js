/**
 * ChannelHeader
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.ChannelHeader', {
  extend: qx.ui.core.Widget,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    const layout = new qx.ui.layout.Grid()
    this._setLayout(layout)
    layout.setColumnAlign(1, 'center', 'middle')
    layout.setColumnAlign(2, 'center', 'middle')
    if (app.Config.target === 'mobile') {
      layout.setColumnFlex(2, 1)
      this._createChildControl('back-button')
      // this._createChildControl('more-button'
    } else {
      layout.setColumnAlign(3, 'left', 'middle')
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    subscription: {
      check: function (value) {
        return (value instanceof app.model.Subscription) || (value instanceof app.model.Channel)
      },
      nullable: true,
      apply: '_applySubscription'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applySubscription: function (value, old) {
      if (old) {
        old.getChannel().removeRelatedBindings(this)
        old.removeRelatedBindings(this)
      }
      if (value) {
        const channel = value.getChannel()
        channel.bind('title', this.getChildControl('title'), 'label')
        value.bind('icon', this.getChildControl('title'), 'icon', {
          converter: function (value) {
            return value + '/16'
          }
        })
        channel.bind('description', this.getChildControl('description'), 'value')
        if (value instanceof app.model.Subscription) {
          value.bind('favorite', this.getChildControl('favorite'), 'icon', {
            converter: function (val) {
              if (val) {
                this.getChildControl('favorite').addState('enabled')
              } else {
                this.getChildControl('favorite').removeState('enabled')
              }
              return val === true ? app.Config.icons.favorite + '/26' : app.Config.icons.noFavorite + '/26'
            }.bind(this)
          })
          this.getChildControl('favorite').show()
        } else {
          this.getChildControl('favorite').exclude()
        }
      }
    },

    _toggleFavorite: function () {
      this.getSubscription().toggleFavorite()
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'back-button':
          control = new qx.ui.form.Button(null, app.Config.icons.back)
          control.addListener('execute', () => {
            const main = qx.core.Init.getApplication().getMain()
            main.getChildControl('menu').getChildControl('list').getSelection().removeAll()
          })
          if (app.Config.target !== 'mobile') {
            control.exclude()
          }
          control.addState('first')
          this._add(control, {row: 0, column: 0, rowSpan: app.Config.target === 'mobile' ? 2 : 1})
          break

        // case 'more-button':
        //   control = new qx.ui.form.Button(null, app.Config.icons.menu + '/30')
        //   control.addListener('execute', () => {
        //     // TODO: open menu
        //   })
        //   if (app.Config.target !== 'mobile') {
        //     control.exclude()
        //   } else {
        //     control.hide()
        //   }
        //   control.addState('last')
        //   this._add(control, {row: 0, column: 3, rowSpan: app.Config.target === 'mobile' ? 2 : 1})
        //   break

        case 'favorite':
          control = new qx.ui.form.Button()
          control.addListener('execute', this._toggleFavorite, this)
          control.addState('last')
          if (app.Config.target !== 'mobile') {
            this._add(control, {row: 0, column: 1})
          } else {
            this._add(control, {row: 0, column: 3, rowSpan: 2})
          }
          break

        case 'title':
          control = new qx.ui.basic.Atom()
          this._add(control, {row: 0, column: 2})
          break

        case 'description':
          control = new qx.ui.basic.Label()
          this._add(control, {row: app.Config.target === 'mobile' ? 1 : 0, column: app.Config.target === 'mobile' ? 2 : 3})
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
