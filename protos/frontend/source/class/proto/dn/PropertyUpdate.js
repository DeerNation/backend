
/**
 *
 * PropertyUpdate class generated from protobuf definition "protos/api.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.PropertyUpdate', {
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
      var f = message.getUid()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getName()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getObject()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.Object.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.PropertyUpdate}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.PropertyUpdate()
      return proto.dn.PropertyUpdate.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.PropertyUpdate} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.PropertyUpdate}
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
            msg.setUid(value)
            break
          case 2:
            value = reader.readString()
            msg.setName(value)
            break
          case 3:
            value = new proto.dn.Object()
            reader.readMessage(value, proto.dn.Object.deserializeBinaryFromReader)
            msg.setObject(value)
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

    uid: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeUid'
    },

    name: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeName'
    },

    object: {
      check: 'proto.dn.Object',
      init: null,
      nullable: true,
      event: 'changeObject'
    }
  }
})
