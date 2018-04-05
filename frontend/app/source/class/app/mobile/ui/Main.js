/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * Main
 *
 * @author tobiasb
 * @since 2018
 * @require(app.ui.channel.View)
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
    this.__currentPage = this.getChildControl('menu')

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
    __currentPage: null,

    /**
     * Show Channel page on stack if subscription is selected, or the menu if not
     * @protected
     */
    _onSelectedSubscription: function (ev) {
      let newView = ev.getData() ? ev.getData().getChannel().getView() : null
      let oldView = ev.getOldData() ? ev.getOldData().getChannel().getView() : null
      if (oldView && oldView !== newView) {
        app.plugins.Registry.getViewInstance(oldView).resetSubscription()
      }
      if (newView) {
        const viewConfig = app.plugins.Registry.getViewConfig(newView)
        if (!viewConfig.instance) {
          viewConfig.instance = new viewConfig.Clazz()
          this.add(viewConfig.instance)
        }
        viewConfig.instance.setSubscription(ev.getData())
        this.showPage(viewConfig.instance, true)
      } else {
        this.showPage(this.getChildControl('menu'), true)
      }
    },

    showPage: function (page, animate) {
      if (this.__currentPage === page) {
        return
      }
      if (!animate) {
        this.setSelection([page])
      } else {
        let animationOut = app.util.Animation.SLIDE_LEFT_OUT
        let animationIn = app.util.Animation.SLIDE_LEFT_IN
        if (page instanceof app.mobile.ui.Menu) {
          animationOut = app.util.Animation.SLIDE_RIGHT_OUT
          animationIn = app.util.Animation.SLIDE_RIGHT_IN
        }
        const currentPage = this.__currentPage

        qx.bom.AnimationFrame.request(() => {
          qx.bom.element.Animation.animate(currentPage.getContentElement().getDomElement(), animationOut)
        })

        const startAnimation = () => {
          qx.bom.AnimationFrame.request(() => {
            const animIn = qx.bom.element.Animation.animate(page.getContentElement().getDomElement(), animationIn)
            this.debug('animating page ' + page.classname + ' in')
            animIn.on('end', () => {
              this.__currentPage = page
              this.setSelection([page])
              this.debug('page ' + page.classname + ' animation ended')
              page.setReady(true)
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
    this._disposeObjects('__currentPage')
  }
})
