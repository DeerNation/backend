
/**
 * Channel class generated from protobuf definition "protos/api.proto".
 * 
 * auto-generated code PLEASE DO NOT EDIT!
 */  

qx.Class.define('proto.dn.Channel', {
  extend: proto.core.BaseMessage,
  
  
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
      var f = undefined;

      f = message.getId();
      if (f.length > 0) {
         writer.writeString(
           1,
           f
        );
      }

      f = message.getDate();
      if (f != null) {
        writer.writeMessage(
          2,
          f,
          proto.google.protobuf.Timestamp.serializeBinaryToWriter
        );
      }
      
    },
    
    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.Channel}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.dn.Channel();
      return proto.dn.Channel.deserializeBinaryFromReader(msg, reader);
    },
    
    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.Channel} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.Channel}
     */
    deserializeBinaryFromReader: function (msg, reader) {
      msg.setDeserialized(true);
      while (reader.nextField()) {
        if (reader.isEndGroup()) {
          break;
        }
        var value;
        var field = reader.getFieldNumber();
        switch (field) {

          case 1:
            value = reader.readString();
            msg.setId(value);
            break;

          case 2:
            value = new proto.google.protobuf.Timestamp;
            reader.readMessage(value, proto.google.protobuf.Timestamp.deserializeBinaryFromReader);
            msg.setDate(value);
            break;
          
          default:
            reader.skipField();
            break;
        }
      }
      return msg;
          
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

    date: {
      check: 'proto.google.protobuf.Timestamp',
      init: null,
      nullable: true,
      event: 'changeDate'
    }
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members: {
    
  }
})
