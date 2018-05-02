
/**
 * Response class generated from protobuf definition "protos/api.proto".
 * Status response from backend
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.Response', {
  extend: proto.core.BaseMessage,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initUids(new app.api.Array())
    this.base(arguments, props)
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics: {
    /**
     * @enum
     */
    Code: {
      OK: 0,
      ERROR: 1,
      FORBIDDEN: 2
    },
    /**
     * Serializes the given message to binary data (in protobuf wire
     * format), writing to the given BinaryWriter.
     * @param message {proto.core.BaseMessage}
     * @param writer {jspb.BinaryWriter}
     * @suppress {unusedLocalVariables} f is only used for nested messages
     */
    serializeBinaryToWriter: function (message, writer) {
      var f = message.getCode()
      if (f !== 0.0) {
        writer.writeEnum(
          1,
          f
        )
      }
      f = message.getMessage()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getUids().toArray()
      if (f != null) {
        writer.writeRepeatedMessage(
          3,
          f,
          proto.dn.Response.UidsEntry.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.Response}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.Response()
      return proto.dn.Response.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.Response} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.Response}
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
            value = reader.readEnum()
            msg.setCode(value)
            break
          case 2:
            value = reader.readString()
            msg.setMessage(value)
            break
          case 3:
            value = new proto.dn.Response.UidsEntry()
            reader.readMessage(value, proto.dn.Response.UidsEntry.deserializeBinaryFromReader)
            msg.getUids().push(value)
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

    /**
     * Enum of type {@link proto.dn.Response.Code}
     */
    code: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeCode'
    },

    message: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeMessage'
    },

    /**
     * @type {app.api.Array} array of {@link proto.dn.Response.UidsEntry}
     */
    uids: {
      check: 'app.api.Array',
      deferredInit: true,
      event: 'changeUids'
    }
  }
})
