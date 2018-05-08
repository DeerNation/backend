
/**
 * ActorChanges class generated from protobuf definition "protos/api.proto".
 * Actor related changes (new subscriptions, other actors/states)
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.ActorChanges', {
  extend: proto.core.BaseMessage,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initSubscription(new app.api.Array())
    this.initActor(new app.api.Array())
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
      var f = message.getType()
      if (f !== 0.0) {
        writer.writeEnum(
          1,
          f
        )
      }
      f = message.getSubscription().toArray()
      if (f != null) {
        writer.writeRepeatedMessage(
          2,
          f,
          proto.dn.model.Subscription.serializeBinaryToWriter
        )
      }
      f = message.getActor().toArray()
      if (f != null) {
        writer.writeRepeatedMessage(
          3,
          f,
          proto.dn.model.Actor.serializeBinaryToWriter
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.ActorChanges}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.ActorChanges()
      return proto.dn.ActorChanges.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.ActorChanges} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.ActorChanges}
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
            value = new proto.dn.model.Subscription()
            reader.readMessage(value, proto.dn.model.Subscription.deserializeBinaryFromReader)
            msg.getSubscription().push(value)
            break
          case 3:
            value = new proto.dn.model.Actor()
            reader.readMessage(value, proto.dn.model.Actor.deserializeBinaryFromReader)
            msg.getActor().push(value)
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
     * @type {app.api.Array} array of {@link proto.dn.model.Subscription}
     */
    subscription: {
      check: 'app.api.Array',
      deferredInit: true,
      event: 'changeSubscription'
    },

    /**
     * @type {app.api.Array} array of {@link proto.dn.model.Actor}
     */
    actor: {
      check: 'app.api.Array',
      deferredInit: true,
      event: 'changeActor'
    }
  }
})
