
/**
 *
 * Object class generated from protobuf definition "protos/api.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
 */
qx.Class.define('proto.dn.Object', {
  extend: proto.core.BaseMessage,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initResetProperties(new app.api.Array())
    this.base(arguments, props)
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics: {
    // array with maps with oneOf referenced type as key and property name as value
    ONEOFS: [],
    /**
     * Returns the allowed type for the oneOf field 'content'.
     * @returns {Array} array of type names as string
     */
    getAllowedTypesOfContent: function () {
      return Object.values(this.ONEOFS[0])
    },
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
      f = message.getActivity()
      if (f != null) {
        writer.writeMessage(
          2,
          f,
          proto.dn.model.Activity.serializeBinaryToWriter
        )
      }
      f = message.getActor()
      if (f != null) {
        writer.writeMessage(
          3,
          f,
          proto.dn.model.Actor.serializeBinaryToWriter
        )
      }
      f = message.getChannel()
      if (f != null) {
        writer.writeMessage(
          4,
          f,
          proto.dn.model.Channel.serializeBinaryToWriter
        )
      }
      f = message.getSubscription()
      if (f != null) {
        writer.writeMessage(
          5,
          f,
          proto.dn.model.Subscription.serializeBinaryToWriter
        )
      }
      f = message.getPublication()
      if (f != null) {
        writer.writeMessage(
          6,
          f,
          proto.dn.model.Publication.serializeBinaryToWriter
        )
      }
      f = message.getResetProperties().toArray()
      if (f.length > 0) {
        writer.writeRepeatedString(
          7,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.Object}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.Object()
      return proto.dn.Object.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.Object} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.Object}
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
            value = new proto.dn.model.Actor()
            reader.readMessage(value, proto.dn.model.Actor.deserializeBinaryFromReader)
            msg.setActor(value)
            break
          case 4:
            value = new proto.dn.model.Channel()
            reader.readMessage(value, proto.dn.model.Channel.deserializeBinaryFromReader)
            msg.setChannel(value)
            break
          case 5:
            value = new proto.dn.model.Subscription()
            reader.readMessage(value, proto.dn.model.Subscription.deserializeBinaryFromReader)
            msg.setSubscription(value)
            break
          case 6:
            value = new proto.dn.model.Publication()
            reader.readMessage(value, proto.dn.model.Publication.deserializeBinaryFromReader)
            msg.setPublication(value)
            break
          case 7:
            value = reader.readString()
            msg.getResetProperties().push(value)
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

    activity: {
      check: 'proto.dn.model.Activity',
      init: null,
      nullable: true,
      event: 'changeActivity',
      apply: '_applyOneOf0'
    },

    actor: {
      check: 'proto.dn.model.Actor',
      init: null,
      nullable: true,
      event: 'changeActor',
      apply: '_applyOneOf0'
    },

    channel: {
      check: 'proto.dn.model.Channel',
      init: null,
      nullable: true,
      event: 'changeChannel',
      apply: '_applyOneOf0'
    },

    subscription: {
      check: 'proto.dn.model.Subscription',
      init: null,
      nullable: true,
      event: 'changeSubscription',
      apply: '_applyOneOf0'
    },

    publication: {
      check: 'proto.dn.model.Publication',
      init: null,
      nullable: true,
      event: 'changePublication',
      apply: '_applyOneOf0'
    },

    /**
     * @type {app.api.Array} array of {@link String}
     */
    resetProperties: {
      check: 'app.api.Array',
      deferredInit: true,
      event: 'changeResetProperties'
    },

    /**
     * oneOfIndex: 0
     */
    content: {
      check: ['activity', 'actor', 'channel', 'subscription', 'publication'],
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
    /**
     * Set value for oneOf field 'content'. Tries to detect the object type and call the correct setter.
     * @param obj {var}
     */
    setOneOfContent: function (obj) {
      if (proto.dn.Object.ONEOFS[0].hasOwnProperty(obj.classname)) {
        this.set(proto.dn.Object.ONEOFS[0][obj.classname], obj)
      } else {
        throw new Error('type ' + obj.classname + ' is invalid for content, allowed types are: ' + Object.keys(proto.dn.Object.ONEOFS[0]).join(', '))
      }
    },
    // oneOf property apply
    _applyOneOf0: function (value, old, name) {
      this.setContent(name)
      
      // reset all other values
      Object.values(proto.dn.Object.ONEOFS[0]).forEach(function (prop) {
        if (prop !== name) {
          this.reset(prop)
        }
      }, this)
    },
    /**
     * Get value for oneOf field 'content'.
     * @returns {var}
     */
    getOneOfContent: function () {
      if (this.getContent()) {
        return this.get(this.getContent())
      }
      return null
    }
  },

  defer: function (statics) {
    statics.ONEOFS[0] = {"proto.dn.model.Activity":"activity","proto.dn.model.Actor":"actor","proto.dn.model.Channel":"channel","proto.dn.model.Subscription":"subscription","proto.dn.model.Publication":"publication"}
  }
})
