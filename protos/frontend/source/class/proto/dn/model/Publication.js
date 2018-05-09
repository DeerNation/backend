
/**
 * A Publication describes the relation of an activity that has been published
 * by an acton in a channel.
 * Publication class generated from protobuf definition "protos/model.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.model.Publication', {
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
      f = message.getActor()
      if (f != null) {
        writer.writeMessage(
          2,
          f,
          proto.dn.model.Actor.serializeBinaryToWriter
        )
      }
      f = message.getChannel()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.model.Channel.serializeBinaryToWriter
        )
      }
      f = message.getActivity()
      if (f != null) {
        writer.writeMessage(
          4,
          f,
          proto.dn.model.Activity.serializeBinaryToWriter
        )
      }
      f = message.getPublished()
      f = f instanceof Date ? Math.round(f.getTime() / 1000) : ''
      if (f.length > 0) {
        writer.writeString(
          5,
          f
        )
      }
      f = message.getMaster()
      if (f !== false) {
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
            msg.setUid(value)
            break
          case 2:
            value = new proto.dn.model.Actor()
            reader.readMessage(value, proto.dn.model.Actor.deserializeBinaryFromReader)
            msg.setActor(value)
            break
          case 3:
            value = new proto.dn.model.Channel()
            reader.readMessage(value, proto.dn.model.Channel.deserializeBinaryFromReader)
            msg.setChannel(value)
            break
          case 4:
            value = new proto.dn.model.Activity()
            reader.readMessage(value, proto.dn.model.Activity.deserializeBinaryFromReader)
            msg.setActivity(value)
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

    uid: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeUid'
    },

    actor: {
      check: 'proto.dn.model.Actor',
      init: null,
      nullable: true,
      event: 'changeActor'
    },

    channel: {
      check: 'proto.dn.model.Channel',
      init: null,
      nullable: true,
      event: 'changeChannel'
    },

    activity: {
      check: 'proto.dn.model.Activity',
      init: null,
      nullable: true,
      event: 'changeActivity'
    },

    published: {
      check: 'Date',
      init: null,
      nullable: true,
      event: 'changePublished',
      transform: '_toDate'
    },

    master: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeMaster'
    }
  }
})
