/**
 * Message renderer
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.plugins.message.Renderer', {
  extend: qx.ui.core.Widget,
  implement: app.ui.renderer.IRenderer,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox(8))
    this.initAttachments(new qx.data.Array())
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    model: {
      nullable: true,
      event: 'changeModel',
      apply: '_applyModel',
      dereference: true
    },

    appearance: {
      refine: true,
      init: 'message-activity'
    },

    type: {
      check: 'String',
      init: 'message'
    },

    link: {
      check: 'String',
      nullable: true,
      apply: '_applyLink'
    },

    attachments: {
      check: 'qx.data.Array',
      deferredInit: true
    },

    linkMetadata: {
      check: 'Map',
      nullable: true,
      apply: '_applyLinkMetadata'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyModel: function (value, old) {
      if (old) {
        old.removeRelatedBindings(this.getChildControl('title'))
        old.getContentObject() && old.getContentObject().removeRelatedBindings(this.getChildControl('message'))
        old.removeListener('changedTitleUrl', this._onChangedTitleUrl, this)
      }
      if (value) {
        let control = this.getChildControl('title')
        value.bind('displayTitle', this.getChildControl('title'), 'value', {
          converter: function (value) {
            if (value) {
              control.show()
            } else {
              control.exclude()
            }
            return value
          }
        })
        const content = value.getContentObject()
        if (content) {
          content.bind('displayMessage', this.getChildControl('message'), 'value')
          content.bind('link', this, 'link')
        } else {
          this.resetLink()
        }
        value.addListener('changedTitleUrl', this._onChangedTitleUrl, this)
        this._onChangedTitleUrl()
      } else {
        this.resetLink()
      }
    },

    // property apply
    _applyLink: function (value, old) {
      if (old) {
        this.setLinkMetadata(null)
      }
      if (value) {
        this.__loadMetadata()
      }
    },

    __loadMetadata: function () {
      if (this.getLink() && !this.getLinkMetadata()) {
        if (!this.getBounds()) {
          this.addListenerOnce('appear', this.__loadMetadata, this)
        } else {
          app.io.MetadataLoader.getInstance().getMeta(this.getLink()).then(meta => {
            this.setLinkMetadata(meta)
          }).catch(err => {
            this.error(err)
          })
        }
      }
    },

    // property apply
    _applyLinkMetadata: function (value, old) {
      if (value) {
        if (value.title) {
          this.getChildControl('title').setValue(value.title)
          this.getChildControl('title').show()
        }
        if (value.description) {
          this.getChildControl('message').setValue(value.description)
          this.getChildControl('message').show()
        }
        if (value.image) {
          this.getChildControl('image').setSource(value.image)
          this.getChildControl('image').show()
        } else {
          this.getChildControl('image').exclude()
        }
      } else {
        this.getChildControl('image').exclude()
      }
    },

    _onChangedTitleUrl: function () {
      if (this.getModel().getTitleUrl()) {
        this.getChildControl('title').addState('link')
        this.getChildControl('title').setToolTipText(this.getModel().getTitleUrl())
      } else {
        this.getChildControl('title').removeState('link')
        this.getChildControl('title').resetToolTipText()
      }
    },

    /**
     * Open the title url of there is one
     * @protected
     */
    _onTitleTap: function () {
      if (this.getModel().getTitleUrl()) {
        window.open(this.getModel().getTitleUrl(), '_blank')
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'title':
          control = new app.ui.basic.Label()
          control.setAnonymous(false)
          control.addListener('tap', this._onTitleTap, this)
          this._addAt(control, 0)
          break

        case 'message':
          control = new app.ui.basic.Label()
          control.setAnonymous(true)
          this._addAt(control, 1, {flex: 1})
          break

        case 'image':
          control = new app.ui.basic.Image()
          control.setAnonymous(false)
          this.addListener('tap', () => {
            if (this.getLink()) {
              window.open(this.getLink(), '_blank')
            }
          })
          control.set({
            maxWidth: 370,
            maxHeight: 270,
            cover: true
          })
          this._addAt(control, 2)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
