/**
 * Error
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.Error', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    show: function (err) {
      if (err instanceof Error) {
        if (qx.core.Environment.get('qx.debug')) {
          console.error(err)
        }
        err = err.message
      } else if (err instanceof qx.event.type.Data) {
        err = err.getData()
      }
      dialog.Dialog.error(err)
    }
  }
})
