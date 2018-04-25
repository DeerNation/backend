
/**
 * Com class generated from protobuf definition "api.proto".
 *
 * auto-generated code PLEASE DO NOT EDIT!
 */
qx.Class.define('proto.dn.Com', {
  extend: app.api.BaseService,
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members: {
    serviceName: 'dn.Com',
    
    /**
     * Subscribe to a channel and receive updates for it
     * @param payload {proto.dn.Channel}
     * @param callback {Function} onMessage callback
     * @param context {Object} onMessage callback context
     * @returns {Promise} resolves to {proto.dn.ActivityChange} 
     */
    subscribe: function (payload, callback, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Channel)
      return this._call(payload, {
        methodName: "subscribe",
        service: this,
        requestStream: false,
        responseStream: true,
        requestType: proto.dn.Channel,
        responseType: proto.dn.ActivityChange
      }, callback, context)
    },

    /**
     *
     * @param payload {proto.dn.Channel}
     * @returns {Promise} resolves to {proto.dn.model.Activities} 
     */
    getActivities: function (payload) {
      qx.core.Assert.assertInstance(payload, proto.dn.Channel)
      return this._call(payload, {
        methodName: "getActivities",
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Channel,
        responseType: proto.dn.model.Activities
      })
    }
  }
})
