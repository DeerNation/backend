
/**
 *
 * Subscription class generated from protobuf definition "protos/model.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.model.Subscription', {
  extend: proto.core.BaseMessage,
  include: [app.api.MSubscription, app.api.MUpdate],

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics: {
    /**
     * Serializes the given message to binary data (in protobuf wire
     * format), writing to the given BinaryWriter.
     * @param message {proto.core.BaseMessage}
     * @param writer {jspb.BinaryWriter}
     * @suppress {unusedLocalVariables} f is only used for nested messages
     */
    serializeBinaryToWriter: function (message, writer) {
      var f = message.getUid()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getChannel()
      if (f != null) {
        writer.writeMessage(
          2,
          f,
          proto.dn.model.Channel.serializeBinaryToWriter
        )
      }
      f = message.getActor()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.model.Actor.serializeBinaryToWriter
        )
      }
      f = message.getFavorite()
      if (f !== false) {
        writer.writeBool(
          4,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Subscription}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Subscription()
      return proto.dn.model.Subscription.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Subscription} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Subscription}
     */
    deserializeBinaryFromReader: function (msg, reader) {
      msg.setDeserialized(true)
      while (reader.nextField()) {
        if (reader.isEndGroup()) {
          break
        }
        var value
        var field = reader.getFieldNumber()
        switch (field) {
          case 1:
            value = reader.readString()
            msg.setUid(value)
            break
          case 2:
            value = new proto.dn.model.Channel()
            reader.readMessage(value, proto.dn.model.Channel.deserializeBinaryFromReader)
            msg.setChannel(value)
            break
          case 3:
            value = new proto.dn.model.Actor()
            reader.readMessage(value, proto.dn.model.Actor.deserializeBinaryFromReader)
            msg.setActor(value)
            break
          case 4:
            value = reader.readBool()
            msg.setFavorite(value)
            break
          default:
            reader.skipField()
            break
        }
      }
      return msg
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties: {

    uid: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeUid'
    },

    channel: {
      check: 'proto.dn.model.Channel',
      init: null,
      nullable: true,
      event: 'changeChannel'
    },

    actor: {
      check: 'proto.dn.model.Actor',
      init: null,
      nullable: true,
      event: 'changeActor'
    },

    favorite: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeFavorite'
    }
  }
})
