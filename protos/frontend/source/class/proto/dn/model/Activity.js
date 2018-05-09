
/**
 * An Activity is everything that can be published in a channel.
 * it contains of some metadata and the content of a certain type.
 * Activity class generated from protobuf definition "protos/model.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.model.Activity', {
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
      f = message.getCreated()
      f = f instanceof Date ? Math.round(f.getTime() / 1000) : ''
      if (f.length > 0) {
        writer.writeString(
          3,
          f
        )
      }
      f = message.getHash()
      if (f.length > 0) {
        writer.writeString(
          4,
          f
        )
      }
      f = message.getActor()
      if (f != null) {
        writer.writeMessage(
          5,
          f,
          proto.dn.model.Actor.serializeBinaryToWriter
        )
      }
      f = message.getRef()
      if (f != null) {
        writer.writeMessage(
          6,
          f,
          proto.dn.model.ExternalRef.serializeBinaryToWriter
        )
      }
      f = message.getMaster()
      if (f !== false) {
        writer.writeBool(
          8,
          f
        )
      }
      f = message.getContent()
      if (f != null) {
        writer.writeMessage(
          9,
          f,
          proto.google.protobuf.Any.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Activity}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Activity()
      return proto.dn.model.Activity.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Activity} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Activity}
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
          case 3:
            value = reader.readString()
            msg.setCreated(value)
            break
          case 4:
            value = reader.readString()
            msg.setHash(value)
            break
          case 5:
            value = new proto.dn.model.Actor()
            reader.readMessage(value, proto.dn.model.Actor.deserializeBinaryFromReader)
            msg.setActor(value)
            break
          case 6:
            value = new proto.dn.model.ExternalRef()
            reader.readMessage(value, proto.dn.model.ExternalRef.deserializeBinaryFromReader)
            msg.setRef(value)
            break
          case 8:
            value = reader.readBool()
            msg.setMaster(value)
            break
          case 9:
            value = new proto.google.protobuf.Any()
            reader.readMessage(value, proto.google.protobuf.Any.deserializeBinaryFromReader)
            msg.setContent(value.getValue())
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

    created: {
      check: 'Date',
      init: null,
      nullable: true,
      event: 'changeCreated',
      transform: '_toDate'
    },

    hash: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeHash'
    },

    actor: {
      check: 'proto.dn.model.Actor',
      init: null,
      nullable: true,
      event: 'changeActor'
    },

    ref: {
      check: 'proto.dn.model.ExternalRef',
      init: null,
      nullable: true,
      event: 'changeRef'
    },

    master: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeMaster'
    },

    content: {
      init: null,
      nullable: true,
      event: 'changeContent'
    }
  }
})
