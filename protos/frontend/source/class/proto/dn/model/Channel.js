
/**
 * Channel class generated from protobuf definition "protos/model.proto".
 *
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.Channel', {
  extend: proto.core.BaseMessage,
  include: [app.api.MChannel, app.api.MUpdate],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initAllowedActivityTypes(new app.api.Array())
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
    Type: {
      PUBLIC: 0,
      PRIVATE: 1
    },
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
      f = message.getType()
      if (f !== 0.0) {
        writer.writeEnum(
          3,
          f
        )
      }
      f = message.getTitle()
      if (f.length > 0) {
        writer.writeString(
          4,
          f
        )
      }
      f = message.getDescription()
      if (f.length > 0) {
        writer.writeString(
          5,
          f
        )
      }
      f = message.getOwner()
      if (f != null) {
        writer.writeMessage(
          6,
          f,
          proto.dn.model.Actor.serializeBinaryToWriter
        )
      }
      f = message.getColor()
      if (f.length > 0) {
        writer.writeString(
          7,
          f
        )
      }
      f = message.getAllowedActivityTypes()
      if (f.length > 0) {
        writer.writeRepeatedString(
          8,
          f
        )
      }
      f = message.getView()
      if (f.length > 0) {
        writer.writeString(
          9,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Channel}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Channel()
      return proto.dn.model.Channel.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Channel} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Channel}
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
            value = reader.readString()
            msg.setId(value)
            break
          case 3:
            value = reader.readEnum()
            msg.setType(value)
            break
          case 4:
            value = reader.readString()
            msg.setTitle(value)
            break
          case 5:
            value = reader.readString()
            msg.setDescription(value)
            break
          case 6:
            value = new proto.dn.model.Actor()
            reader.readMessage(value, proto.dn.model.Actor.deserializeBinaryFromReader)
            msg.setOwner(value)
            break
          case 7:
            value = reader.readString()
            msg.setColor(value)
            break
          case 8:
            value = reader.readString()
            msg.getAllowedActivityTypes().push(value)
            break
          case 9:
            value = reader.readString()
            msg.setView(value)
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

    id: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeId'
    },

    /**
     * Enum of type {@link proto.dn.model.Channel.Type}
     */
    type: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeType'
    },

    title: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeTitle'
    },

    description: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeDescription'
    },

    owner: {
      check: 'proto.dn.model.Actor',
      init: null,
      nullable: true,
      event: 'changeOwner'
    },

    color: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeColor'
    },

    /**
     * @type {app.api.Array} array of {@link String}
     */
    allowedActivityTypes: {
      check: 'app.api.Array',
      deferredInit: true,
      event: 'changeAllowedActivityTypes'
    },

    view: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeView'
    }
  }
})
