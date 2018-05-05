/**
 * Singleton access to {link proto.dn.Com}
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Class.define('app.api.Service', {
  extend: proto.dn.Com,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments, app.io.Socket.getInstance())
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    createChannelModel: function (payload, changeType) {
      const model = new proto.dn.ChannelModel()
      if (changeType) {
        model.setType(changeType)
      }
      if (payload instanceof proto.dn.WritingUser) {
        model.setWritingUser(payload)
      }
      return model
    }
  }
})
