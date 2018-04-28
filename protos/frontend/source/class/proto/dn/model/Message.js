
/**
 * Message class generated from protobuf definition "model.proto".
 * A Message is the basic activity content type: a simple message that can contain
 * anything encoded in a markdown notation.
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.Message', {
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
      var f = message.getMessage()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getLink()
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
     * @return {proto.dn.model.Message}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Message()
      return proto.dn.model.Message.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Message} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Message}
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
            msg.setMessage(value)
            break
          case 2:
            value = reader.readString()
            msg.setLink(value)
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

    message: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeMessage'
    },

    link: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeLink'
    }
  }
})
