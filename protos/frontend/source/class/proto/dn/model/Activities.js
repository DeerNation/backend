
/**
 * Activities class generated from protobuf definition "protos/model.proto".
 * *
 A List of activities
 * auto-generated code PLEASE DO NOT EDIT!
 */  

qx.Class.define('proto.dn.model.Activities', {
  extend: proto.core.BaseMessage,
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function (props) {
    this.initActivities(new qx.data.Array());
    this.base(arguments, props);
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
      var f = undefined;

      f = message.getActivities().toArray();
      if (f != null) {
        writer.writeRepeatedMessage(
          1,
          f,
          proto.dn.model.Activity.serializeBinaryToWriter
        );
      }
      
    },
    
    /**
     * Deserializes binary data (in protobuf wire format).
     * @param bytes {jspb.ByteSource} The bytes to deserialize.
     * @return {proto.dn.model.Activities}
     */
    deserializeBinary: function (bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.dn.model.Activities();
      return proto.dn.model.Activities.deserializeBinaryFromReader(msg, reader);
    },
    
    /**
     * Deserializes binary data (in protobuf wire format) from the
     * given reader into the given message object.
     * @param msg {proto.dn.model.Activities} The message object to deserialize into.
     * @param reader {jspb.BinaryReader} The BinaryReader to use.
     * @return {proto.dn.model.Activities}
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
            value = new proto.dn.model.Activity;
            reader.readMessage(value, proto.dn.model.Activity.deserializeBinaryFromReader);
            msg.getActivities().push(value);
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

    /**
     * @type {qx.data.Array} array of {@link proto.dn.model.Activity}
     */
    activities: {
      check: 'qx.data.Array',
      deferredInit: true,
      event: 'changeActivities'
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
