/**
 * The MetadataLoader loads open graph data from URLs.
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.io.MetadataLoader', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this.__cache = {}
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __cache: null,

    getMeta: function (url) {
      return new qx.Promise((resolve, reject) => {
        if (this.__cache.hasOwnProperty(url)) {
          if (this.__cache[url].state === 'loading') {
            qx.event.message.Bus.subscribe('metaloader.' + url, (e) => {
              resolve(e.getData())
            })
          } else {
            resolve(this.__cache[url].meta)
          }
        } else {
          const req = new qx.io.request.Xhr(app.Config.getBackendUrl() + '/meta/' + url)
          req.set({
            accept: 'application/json',
            cache: true
          })
          req.addListenerOnce('success', e => {
            const metadata = e.getTarget().getResponse()
            console.log(metadata)
            this.__cache[url].meta = metadata
            qx.event.message.Bus.dispatchByName('metaloader.' + url, metadata)
            resolve(metadata)
            delete this.__cache[url].xhr
            this.__cache[url].state = 'done'
          })

          req.addListenerOnce('statusError', () => {
            reject(new Error('error loading ' + url))
          })
          // Send request
          req.send()
          this.__cache[url] = {
            state: 'loading',
            xhr: req
          }
        }
      })
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    this.__cache = {}
  }
})
