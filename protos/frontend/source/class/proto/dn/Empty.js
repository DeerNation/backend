
/**
 * Empty class generated from protobuf definition "api.proto".
 *
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.Empty', {
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
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.Empty}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.Empty()
      return proto.dn.Empty.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.Empty} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.Empty}
     */
    deserializeBinaryFromReader: function (msg, reader) {
      
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties: {
  }
})
