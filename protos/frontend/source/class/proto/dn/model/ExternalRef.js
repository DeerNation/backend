
/**
 * ExternalRef class generated from protobuf definition "protos/model.proto".
 * Reference to an external source, e.g. a facebook feed entry, an external website, etc.
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.ExternalRef', {
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
      var f = message.getType()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getId()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getOriginal()
      if (f.length > 0) {
        writer.writeString(
          3,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.ExternalRef}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.ExternalRef()
      return proto.dn.model.ExternalRef.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.ExternalRef} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.ExternalRef}
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
            msg.setType(value)
            break
          case 2:
            value = reader.readString()
            msg.setId(value)
            break
          case 3:
            value = reader.readString()
            msg.setOriginal(value)
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

    type: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeType'
    },

    id: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeId'
    },

    original: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeOriginal'
    }
  }
})
