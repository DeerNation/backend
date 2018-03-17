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
    this._setLayout(new qx.ui.layout.HBox())
    this._getLayout().setAlignY('middle')

    this._createChildControl('back-button')
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
          value.bind('favorite', this.getChildControl('favorite'), 'source', {
            converter: function (val) {
              if (val) {
                this.getChildControl('favorite').addState('enabled')
              } else {
                this.getChildControl('favorite').removeState('enabled')
              }
              return val === true ? app.Config.icons.favorite + '/18' : app.Config.icons.noFavorite + '/18'
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
          this._addAt(control, 0)
          break
        case 'favorite':
          control = new qx.ui.basic.Image()
          control.addListener('tap', this._toggleFavorite, this)
          this._addAt(control, 2)
          break

        case 'title':
          control = new qx.ui.basic.Atom()
          this._addAt(control, 3)
          break

        case 'description':
          control = new qx.ui.basic.Label()
          this._addAt(control, 4)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
