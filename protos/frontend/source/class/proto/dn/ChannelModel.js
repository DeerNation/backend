
/**
 * The ChannelModel contains:
 * - allowed actions for current user on channel
 * - allowed actions for current user on channel activities
 * - the channels publications
 * ChannelModel class generated from protobuf definition "protos/api.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.ChannelModel', {
  extend: proto.core.BaseMessage,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initPublications(new app.api.Array())
    this.base(arguments, props)
  },

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
      var f = message.getType()
      if (f !== 0.0) {
        writer.writeEnum(
          1,
          f
        )
      }
      f = message.getPublications().toArray()
      if (f != null) {
        writer.writeRepeatedMessage(
          2,
          f,
          proto.dn.model.Publication.serializeBinaryToWriter
        )
      }
      f = message.getChannelActions()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.model.AclActions.serializeBinaryToWriter
        )
      }
      f = message.getActivityActions()
      if (f != null) {
        writer.writeMessage(
          4,
          f,
          proto.dn.model.AclActions.serializeBinaryToWriter
        )
      }
      f = message.getWritingUser()
      if (f != null) {
        writer.writeMessage(
          5,
          f,
          proto.dn.WritingUser.serializeBinaryToWriter
        )
      }
      f = message.getObject()
      if (f != null) {
        writer.writeMessage(
          6,
          f,
          proto.dn.Object.serializeBinaryToWriter
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
            value = reader.readEnum()
            msg.setType(value)
            break
          case 2:
            value = new proto.dn.model.Publication()
            reader.readMessage(value, proto.dn.model.Publication.deserializeBinaryFromReader)
            msg.getPublications().push(value)
            break
          case 3:
            value = new proto.dn.model.AclActions()
            reader.readMessage(value, proto.dn.model.AclActions.deserializeBinaryFromReader)
            msg.setChannelActions(value)
            break
          case 4:
            value = new proto.dn.model.AclActions()
            reader.readMessage(value, proto.dn.model.AclActions.deserializeBinaryFromReader)
            msg.setActivityActions(value)
            break
          case 5:
            value = new proto.dn.WritingUser()
            reader.readMessage(value, proto.dn.WritingUser.deserializeBinaryFromReader)
            msg.setWritingUser(value)
            break
          case 6:
            value = new proto.dn.Object()
            reader.readMessage(value, proto.dn.Object.deserializeBinaryFromReader)
            msg.setObject(value)
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
     * Enum of type {@link proto.dn.ChangeType}
     */
    type: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeType'
    },

    /**
     * @type {app.api.Array} array of {@link proto.dn.model.Publication}
     */
    publications: {
      check: 'app.api.Array',
      deferredInit: true,
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
    },

    writingUser: {
      check: 'proto.dn.WritingUser',
      init: null,
      nullable: true,
      event: 'changeWritingUser'
    },

    object: {
      check: 'proto.dn.Object',
      init: null,
      nullable: true,
      event: 'changeObject'
    }
  }
})
