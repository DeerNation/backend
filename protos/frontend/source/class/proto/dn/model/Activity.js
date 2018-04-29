
/**
 * Activity class generated from protobuf definition "protos/model.proto".
 * An Activity is everything that can be published in a channel.
 * it contains of some metadata and the content of a certain type.
 * auto-generated code PLEASE DO NOT EDIT!
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
    // array with oneOf property groups
    ONEOFS: [],
    /**
     * Returns the allowed type for the oneOf field 'content'.
     * @returns {Array} array of type names as string
     */
    getAllowedTypesOfContent: function () {
      return this.ONEOFS[0]
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

    uid: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeUid'
    },

    created: {
      check: 'Date',
      init: '',
      nullable: false,
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

    published: {
      check: 'Date',
      init: '',
      nullable: false,
      event: 'changePublished',
      transform: '_toDate'
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
    // oneOf property apply
    _applyOneOf0: function (value, old, name) {
      if (value !== null) {
        this.setContent(value)
      }

      // reset all other values
      proto.dn.model.Activity.ONEOFS[0].forEach(function (prop) {
        if (prop !== name) {
          this.reset(prop)
        }
      }, this)
    },
    /**
     * Set value for oneOf field 'content'. Tries to detect the object type and call the correct setter.
     * @param obj {Object}
     */
    setOneOfContent: function (obj) {
      var type = obj.basename.toLowerCase()
      if (proto.dn.model.Activity.ONEOFS[0].includes(type)) {
        this.set(type, obj)
      } else {
        throw new Error('type ' + type + ' is invalid for content, allowed types are: ' + proto.dn.model.Activity.ONEOFS[0].join(', '))
      }
    }
  },

  defer: function (statics) {
    statics.ONEOFS[0] = ['message', 'event']
  }
})
