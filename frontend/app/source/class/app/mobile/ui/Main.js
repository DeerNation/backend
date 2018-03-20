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
    this.__currentPageName = 'menu'

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
    __currentPageName: null,

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
        this.showPage(newView, true)
      } else {
        this.showPage('menu', true)
      }
    },

    showPage: function (pageName, animate) {
      if (this.__currentPageName === pageName) {
        return
      }
      if (!animate) {
        this.setSelection([this.getChildControl(pageName)])
      } else {
        let animationOut = app.util.Animation.SLIDE_LEFT_OUT
        let animationIn = app.util.Animation.SLIDE_LEFT_IN
        if (pageName === 'menu') {
          animationOut = app.util.Animation.SLIDE_RIGHT_OUT
          animationIn = app.util.Animation.SLIDE_RIGHT_IN
        }
        const currentPage = this.getChildControl(this.__currentPageName)
        const page = this.getChildControl(pageName)

        qx.bom.AnimationFrame.request(function() {
          qx.bom.element.Animation.animate(currentPage.getContentElement().getDomElement(), animationOut)
        })

        const startAnimation = () => {
          qx.bom.AnimationFrame.request(() => {
            const animIn = qx.bom.element.Animation.animate(page.getContentElement().getDomElement(), animationIn)
            this.debug('animating page ' + page.classname + ' in')
            animIn.on('end', () => {
              this.__currentPageName = pageName
              this.setSelection([page])
              this.debug('page ' + page.classname + ' animation ended')
            })
          })
        }

        if (!page.isVisible()) {
          this.debug('waiting for page ' + page.classname + ' to appear')
          page.addListenerOnce('appear', startAnimation, this)
          page.show()
        } else {
          startAnimation()
        }
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'menu':
          control = app.mobile.ui.Menu.getInstance()
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
