
/**
 * Actor class generated from protobuf definition "protos/model.proto".
 *
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.Actor', {
  extend: proto.core.BaseMessage,
  include: [app.api.MActor, app.api.MUpdate],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initSubscriptions(new app.api.Array())
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
      PERSON: 0,
      SERVER: 1,
      BOT: 2
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
      f = message.getType()
      if (f !== 0.0) {
        writer.writeEnum(
          2,
          f
        )
      }
      f = message.getUsername()
      if (f.length > 0) {
        writer.writeString(
          3,
          f
        )
      }
      f = message.getRole()
      if (f != null) {
        writer.writeMessage(
          4,
          f,
          proto.dn.model.ACLRole.serializeBinaryToWriter
        )
      }
      f = message.getName()
      if (f.length > 0) {
        writer.writeString(
          5,
          f
        )
      }
      f = message.getEmail()
      if (f.length > 0) {
        writer.writeString(
          6,
          f
        )
      }
      f = message.getColor()
      if (f.length > 0) {
        writer.writeString(
          7,
          f
        )
      }
      f = message.getLocale()
      if (f.length > 0) {
        writer.writeString(
          8,
          f
        )
      }
      f = message.getSubscriptions().toArray()
      if (f != null) {
        writer.writeRepeatedMessage(
          9,
          f,
          proto.dn.model.Subscription.serializeBinaryToWriter
        )
      }
      f = message.getOnline()
      if (f != null) {
        writer.writeBool(
          10,
          f
        )
      }
      f = message.getStatus()
      if (f.length > 0) {
        writer.writeString(
          11,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Actor}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Actor()
      return proto.dn.model.Actor.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Actor} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Actor}
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
            value = reader.readEnum()
            msg.setType(value)
            break
          case 3:
            value = reader.readString()
            msg.setUsername(value)
            break
          case 4:
            value = new proto.dn.model.ACLRole()
            reader.readMessage(value, proto.dn.model.ACLRole.deserializeBinaryFromReader)
            msg.setRole(value)
            break
          case 5:
            value = reader.readString()
            msg.setName(value)
            break
          case 6:
            value = reader.readString()
            msg.setEmail(value)
            break
          case 7:
            value = reader.readString()
            msg.setColor(value)
            break
          case 8:
            value = reader.readString()
            msg.setLocale(value)
            break
          case 9:
            value = new proto.dn.model.Subscription()
            reader.readMessage(value, proto.dn.model.Subscription.deserializeBinaryFromReader)
            msg.getSubscriptions().push(value)
            break
          case 10:
            value = reader.readBool()
            msg.setOnline(value)
            break
          case 11:
            value = reader.readString()
            msg.setStatus(value)
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

    /**
     * Enum of type {@link proto.dn.model.Actor.Type}
     */
    type: {
      check: 'Number',
      init: 0,
      nullable: false,
      event: 'changeType'
    },

    username: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeUsername'
    },

    role: {
      check: 'proto.dn.model.ACLRole',
      init: null,
      nullable: true,
      event: 'changeRole'
    },

    name: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeName'
    },

    email: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeEmail'
    },

    color: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeColor'
    },

    locale: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeLocale'
    },

    /**
     * @type {app.api.Array} array of {@link proto.dn.model.Subscription}
     */
    subscriptions: {
      check: 'app.api.Array',
      deferredInit: true,
      event: 'changeSubscriptions'
    },

    online: {
      check: 'Boolean',
      init: false,
      nullable: false,
      event: 'changeOnline'
    },

    status: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeStatus'
    }
  }
})
