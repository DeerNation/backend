
/**
 * ChannelModel class generated from protobuf definition "api.proto".
 * The ChannelModel contains:
 * - allowed actions for current user on channel
 * - allowed actions for current user on channel activities
 * - the channels publications
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.ChannelModel', {
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
      var f = message.getPublications()
      if (f != null) {
        writer.writeMessage(
          1,
          f,
          proto.dn.model.Publications.serializeBinaryToWriter
        )
      }
      f = message.getChannelActions()
      if (f != null) {
        writer.writeMessage(
          2,
          f,
          proto.dn.model.AclActions.serializeBinaryToWriter
        )
      }
      f = message.getActivityActions()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.model.AclActions.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.ChannelModel}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.ChannelModel()
      return proto.dn.ChannelModel.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.ChannelModel} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.ChannelModel}
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
            value = new proto.dn.model.Publications()
            reader.readMessage(value, proto.dn.model.Publications.deserializeBinaryFromReader)
            msg.setPublications(value)
            break
          case 2:
            value = new proto.dn.model.AclActions()
            reader.readMessage(value, proto.dn.model.AclActions.deserializeBinaryFromReader)
            msg.setChannelActions(value)
            break
          case 3:
            value = new proto.dn.model.AclActions()
            reader.readMessage(value, proto.dn.model.AclActions.deserializeBinaryFromReader)
            msg.setActivityActions(value)
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

    publications: {
      check: 'proto.dn.model.Publications',
      init: null,
      nullable: true,
      event: 'changePublications'
    },

    channelActions: {
      check: 'proto.dn.model.AclActions',
      init: null,
      nullable: true,
      event: 'changeChannelActions'
    },

    activityActions: {
      check: 'proto.dn.model.AclActions',
      init: null,
      nullable: true,
      event: 'changeActivityActions'
    }
  }
})
