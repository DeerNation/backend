
/**
 * Activity class generated from protobuf definition "model.proto".
 * An Activity is everything that can be published in a channel.
 * it contains of some metadata and the content of a certain type.
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.Activity', {
  extend: proto.core.BaseMessage,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.__oneOfs = []
    this.__oneOfs[0] = ['message', 'event']
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
      f = message.getType()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getCreated()
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
      f = message.getActorId()
      if (f.length > 0) {
        writer.writeString(
          5,
          f
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
      f = message.getChannelId()
      if (f.length > 0) {
        writer.writeString(
          7,
          f
        )
      }
      f = message.getMaster()
      if (f != null) {
        writer.writeBool(
          8,
          f
        )
      }
      f = message.getPublished()
      if (f.length > 0) {
        writer.writeString(
          9,
          f
        )
      }

      f = message.getMessage()
      if (f != null) {
        writer.writeMessage(
          20,
          f,
          proto.dn.model.Message.serializeBinaryToWriter
        )
      }

      f = message.getEvent()
      if (f != null) {
        writer.writeMessage(
          21,
          f,
          proto.dn.model.Event.serializeBinaryToWriter
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
            msg.setType(value)
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
            value = reader.readString()
            msg.setActorId(value)
            break
          case 6:
            value = new proto.dn.model.ExternalRef()
            reader.readMessage(value, proto.dn.model.ExternalRef.deserializeBinaryFromReader)
            msg.setRef(value)
            break
          case 7:
            value = reader.readString()
            msg.setChannelId(value)
            break
          case 8:
            value = reader.readBool()
            msg.setMaster(value)
            break
          case 9:
            value = reader.readString()
            msg.setPublished(value)
            break
          case 20:
            value = new proto.dn.model.Message()
            reader.readMessage(value, proto.dn.model.Message.deserializeBinaryFromReader)
            msg.setMessage(value)
            break
          case 21:
            value = new proto.dn.model.Event()
            reader.readMessage(value, proto.dn.model.Event.deserializeBinaryFromReader)
            msg.setEvent(value)
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

    type: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeType'
    },

    created: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeCreated'
    },

    hash: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeHash'
    },

    actorId: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeActorId'
    },

    ref: {
      check: 'proto.dn.model.ExternalRef',
      init: null,
      nullable: true,
      event: 'changeRef'
    },

    channelId: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeChannelId'
    },

    master: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeMaster'
    },

    published: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changePublished'
    },

    message: {
      check: 'proto.dn.model.Message',
      init: null,
      nullable: true,
      event: 'changeMessage',
      apply: '_applyOneOf0'
    },

    event: {
      check: 'proto.dn.model.Event',
      init: null,
      nullable: true,
      event: 'changeEvent',
      apply: '_applyOneOf0'
    },

    /**
     * oneOfIndex: 0
     */
    content: {
      check: 'proto.core.BaseMessage',
      init: null,
      event: 'changeContent'
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members: {

    // array with oneOf property groups
    __oneOfs: null,

    // oneOf property apply
    _applyOneOf0: function (value, old, name) {
      if (value !== null) {
        this.setContent(value)
      }

      // reset all other values
      this.__oneOfs[0].forEach(function (prop) {
        if (prop !== name) {
          this.reset(prop)
        }
      }, this)
    },

    setOneOfContent: function (obj) {
      var type = obj.basename.toLowerCase()
      if (this.__oneOfs[0].includes(type)) {
        this.set(type, obj)
      } else {
        throw new Error('type ' + type + ' is invalid for content, allowed types are: ' + this.__oneOfs[0].join(', '))
      }
    }
  }

})
