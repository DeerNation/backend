
/**
 *
 * Token class generated from protobuf definition "protos/api.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.Token', {
  extend: proto.core.BaseMessage,

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
      var f = message.getNewToken()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getOldToken()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.Token}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.Token()
      return proto.dn.Token.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.Token} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.Token}
     */
    deserializeBinaryFromReader: function (msg, reader) {
      msg.$$deserializing = true
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
            msg.setNewToken(value)
            break
          case 2:
            value = reader.readString()
            msg.setOldToken(value)
            break
          default:
            reader.skipField()
            break
        }
      }
      msg.$$deserializing = false
      return msg
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties: {

    newToken: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeNewToken'
    },

    oldToken: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeOldToken'
    }
  }
})
