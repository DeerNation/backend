
/**
 * Event class generated from protobuf definition "protos/model.proto".
 * An Event is a date related activity with a start and end date.
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.model.Event', {
  extend: proto.core.BaseMessage,
  include: [app.plugins.event.MEvent],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initCategories(new qx.data.Array())
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
      var f = message.getUid()
      if (f.length > 0) {
        writer.writeString(
          1,
          f
        )
      }
      f = message.getName()
      if (f.length > 0) {
        writer.writeString(
          2,
          f
        )
      }
      f = message.getLocation()
      if (f.length > 0) {
        writer.writeString(
          3,
          f
        )
      }
      f = message.getStart()
      if (f.length > 0) {
        writer.writeString(
          4,
          f
        )
      }
      f = message.getEnd()
      if (f.length > 0) {
        writer.writeString(
          5,
          f
        )
      }
      f = message.getCategories()
      if (f.length > 0) {
        writer.writeRepeatedString(
          6,
          f
        )
      }
      f = message.getOrganizer()
      if (f.length > 0) {
        writer.writeString(
          7,
          f
        )
      }
      f = message.getDescription()
      if (f.length > 0) {
        writer.writeString(
          8,
          f
        )
      }
    },

    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Event}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes)
      var msg = new proto.dn.model.Event()
      return proto.dn.model.Event.deserializeBinaryFromReader(msg, reader)
    },

    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Event} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Event}
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
            msg.setName(value)
            break
          case 3:
            value = reader.readString()
            msg.setLocation(value)
            break
          case 4:
            value = reader.readString()
            msg.setStart(value)
            break
          case 5:
            value = reader.readString()
            msg.setEnd(value)
            break
          case 6:
            value = reader.readString()
            msg.getCategories().push(value)
            break
          case 7:
            value = reader.readString()
            msg.setOrganizer(value)
            break
          case 8:
            value = reader.readString()
            msg.setDescription(value)
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

    name: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeName'
    },

    location: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeLocation'
    },

    start: {
      check: 'Date',
      init: '',
      nullable: false,
      event: 'changeStart',
      transform: '_toDate'
    },

    end: {
      check: 'Date',
      init: '',
      nullable: false,
      event: 'changeEnd',
      transform: '_toDate'
    },

    /**
     * @type {qx.data.Array} array of {@link String}
     */
    categories: {
      check: 'qx.data.Array',
      deferredInit: true,
      event: 'changeCategories'
    },

    organizer: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeOrganizer'
    },

    description: {
      check: 'String',
      init: '',
      nullable: false,
      event: 'changeDescription'
    }
  }
})
