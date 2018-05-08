
/**
 *
 * Query class generated from protobuf definition "protos/api.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.Query', {
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
      var f = message.getBaseName()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getFilter()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getLocation()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.Point.serializeBinaryToWriter
        )
      }
      f = message.getRadius()
      if (f !== 0) {
        writer.writeInt32(
          4,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.Query}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.Query()
      return proto.dn.Query.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.Query} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.Query}
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
            msg.setBaseName(value)
            break
          case 2:
            value = reader.readString()
            msg.setFilter(value)
            break
          case 3:
            value = new proto.dn.Point()
            reader.readMessage(value, proto.dn.Point.deserializeBinaryFromReader)
            msg.setLocation(value)
            break
          case 4:
            value = reader.readInt32()
            msg.setRadius(value)
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

    baseName: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeBaseName'
    },

    filter: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeFilter'
    },

    location: {
      check: 'proto.dn.Point',
      init: null,
      nullable: true,
      event: 'changeLocation'
    },

    radius: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeRadius'
    }
  }
})
