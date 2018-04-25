
/**
 * Publication class generated from protobuf definition "model.proto".
 * A Publication describes the relation of an activity that has been published
 * by an acton in a channel.
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.Publication', {
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
      var f = message.getId()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getActorId()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getChannelId()
      if (f.length > 0) {
        writer.writeString(
          3,
          f
        )
      }
      f = message.getActivityId()
      if (f.length > 0) {
        writer.writeString(
          4,
          f
        )
      }
      f = message.getPublished()
      if (f.length > 0) {
        writer.writeString(
          5,
          f
        )
      }
      f = message.getMaster()
      if (f != null) {
        writer.writeBool(
          6,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Publication}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Publication()
      return proto.dn.model.Publication.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Publication} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Publication}
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
            msg.setId(value)
            break
          case 2:
            value = reader.readString()
            msg.setActorId(value)
            break
          case 3:
            value = reader.readString()
            msg.setChannelId(value)
            break
          case 4:
            value = reader.readString()
            msg.setActivityId(value)
            break
          case 5:
            value = reader.readString()
            msg.setPublished(value)
            break
          case 6:
            value = reader.readBool()
            msg.setMaster(value)
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

    id: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeId'
    },

    actorId: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeActorId'
    },

    channelId: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeChannelId'
    },

    activityId: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeActivityId'
    },

    published: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changePublished'
    },

    master: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeMaster'
    }
  }
})
