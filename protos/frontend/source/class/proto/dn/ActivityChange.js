
/**
 * ActivityChange class generated from protobuf definition "api.proto".
 * ActivityChange messages are the messages sent in a channel.
 * They contain either an update for an activity or an internal
 * status update for the channel, like a currently writing user state.
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.ActivityChange', {
  extend: proto.core.BaseMessage,


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics: {
    // array with oneOf property groups
    ONEOFS: [],
    
    /**
     * @enum
     */
    Type: {
      ADD: 0,
      UPDATE: 1,
      DELETE: 2,
      INTERNAL: 3
    },
        
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
      var f = message.getType()
      if (f !== 0.0) {
        writer.writeEnum(
          1,
          f
        )
      }
      f = message.getActivity()
      if (f != null) {
        writer.writeMessage(
          2,
          f,
          proto.dn.model.Activity.serializeBinaryToWriter
        )
      }
      f = message.getWriting()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.WritingUser.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.ActivityChange}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.ActivityChange()
      return proto.dn.ActivityChange.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.ActivityChange} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.ActivityChange}
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
            value = new proto.dn.model.Activity()
            reader.readMessage(value, proto.dn.model.Activity.deserializeBinaryFromReader)
            msg.setActivity(value)
            break
          case 3:
            value = new proto.dn.WritingUser()
            reader.readMessage(value, proto.dn.WritingUser.deserializeBinaryFromReader)
            msg.setWriting(value)
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
     * Enum of type {@link proto.dn.ActivityChange.Type}
     */
    type: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeType'
    },

    activity: {
      check: 'proto.dn.model.Activity',
      init: null,
      nullable: true,
      event: 'changeActivity',
      apply: '_applyOneOf0'
    },

    writing: {
      check: 'proto.dn.WritingUser',
      init: null,
      nullable: true,
      event: 'changeWriting',
      apply: '_applyOneOf0'
    },

    /**
     * oneOfIndex: 0
     */
    content: {
      check: proto.core.BaseMessage,
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
      proto.dn.ActivityChange.ONEOFS[0].forEach(function (prop) {
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
      if (proto.dn.ActivityChange.ONEOFS[0].includes(type)) {
        this.set(type, obj)
      } else {
        throw new Error('type ' + type + ' is invalid for content, allowed types are: ' + proto.dn.ActivityChange.ONEOFS[0].join(', '))
      }
    }
  },

  defer: function (statics) {
    statics.ONEOFS[0] = ['activity', 'writing']
  }
})
