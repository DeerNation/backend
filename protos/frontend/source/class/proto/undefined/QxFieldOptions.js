
/**
 *
 * QxFieldOptions class generated from protobuf definition "protos/extensions.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.undefined.QxFieldOptions', {
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
     */
    serializeBinaryToWriter: function (message, writer) {
      var f = message.getAnnotations()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getDate()
      if (f !== false) {
        writer.writeBool(
          2,
          f
        )
      }
      f = message.getValidate()
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
     * @return {proto.undefined.QxFieldOptions}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.undefined.QxFieldOptions()
      return proto.undefined.QxFieldOptions.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.undefined.QxFieldOptions} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.undefined.QxFieldOptions}
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
            msg.setAnnotations(value)
            break
          case 2:
            value = reader.readBool()
            msg.setDate(value)
            break
          case 3:
            value = reader.readString()
            msg.setValidate(value)
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

    annotations: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeAnnotations'
    },

    date: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeDate'
    },

    validate: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeValidate'
    }
  }
})
