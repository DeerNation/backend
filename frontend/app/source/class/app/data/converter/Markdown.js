/**
 * Converts markdown strings into HTML using Showdown {@link http://www.showdownjs.com/}
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @ignore(showdown)
 */

qx.Class.define('app.data.converter.Markdown', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    __converter: null,

    convert: function (data) {
      if (!app.data.converter.Markdown.__converter) {
        app.data.converter.Markdown.__converter = new showdown.Converter()
      }
      return app.data.converter.Markdown.__converter.makeHtml(data)
    }
  }
})
