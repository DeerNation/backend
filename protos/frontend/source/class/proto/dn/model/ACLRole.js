
/**
 *
 * ACLRole class generated from protobuf definition "protos/model.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * @require(proto.dn.model.ACLRole)
 */
qx.Class.define('proto.dn.model.ACLRole', {
  extend: proto.core.BaseMessage,
  include: [app.api.MUpdate],

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
      f = message.getId()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getWeight()
      if (f !== 0) {
        writer.writeInt32(
          3,
          f
        )
      }
      f = message.getParent()
      if (f != null) {
        writer.writeMessage(
          4,
          f,
          proto.dn.model.ACLRole.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.ACLRole}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.ACLRole()
      return proto.dn.model.ACLRole.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.ACLRole} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.ACLRole}
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
            msg.setId(value)
            break
          case 3:
            value = reader.readInt32()
            msg.setWeight(value)
            break
          case 4:
            value = new proto.dn.model.ACLRole()
            reader.readMessage(value, proto.dn.model.ACLRole.deserializeBinaryFromReader)
            msg.setParent(value)
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

    id: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeId'
    },

    weight: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeWeight'
    },

    parent: {
      check: 'proto.dn.model.ACLRole',
      init: null,
      nullable: true,
      event: 'changeParent'
    }
  }
})
