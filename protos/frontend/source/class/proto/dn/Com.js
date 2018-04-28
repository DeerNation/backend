
/**
 * Com class generated from protobuf definition "protos/api.proto".
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
     * @param payload {proto.dn.ChannelRequest}
     * @param callback {Function} onMessage callback
     * @param context {Object} onMessage callback context
     * @returns {Promise} resolves to {proto.dn.ActivityChange} 
     */
    subscribe: function (payload, callback, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.ChannelRequest)
      return this._call(payload, {
        methodName: 'subscribe',
        service: this,
        requestStream: false,
        responseStream: true,
        requestType: proto.dn.ChannelRequest,
        responseType: proto.dn.ActivityChange
      }, callback, context)
    },

    /**
     *
     * @param payload {proto.dn.ChannelRequest}
     * @returns {Promise} resolves to {proto.dn.model.Publications} 
     */
    getPublications: function (payload) {
      qx.core.Assert.assertInstance(payload, proto.dn.ChannelRequest)
      return this._call(payload, {
        methodName: 'getPublications',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.ChannelRequest,
        responseType: proto.dn.model.Publications
      })
    },

    /**
     *
     * @param payload {proto.dn.model.Publication}
     * @returns {Promise} resolves to {proto.dn.Response} 
     */
    publish: function (payload) {
      qx.core.Assert.assertInstance(payload, proto.dn.model.Publication)
      return this._call(payload, {
        methodName: 'publish',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.model.Publication,
        responseType: proto.dn.Response
      })
    },

    /**
     * Retuns the complete model for the currently authenticated user.
     * The model contains:
     * - the current actor (including its subscriptions)
     * - all other Actors
     * - all public channels
     * @param payload {proto.dn.Empty}
     * @returns {Promise} resolves to {proto.dn.Model} 
     */
    getModel: function (payload) {
      qx.core.Assert.assertInstance(payload, proto.dn.Empty)
      return this._call(payload, {
        methodName: 'getModel',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Empty,
        responseType: proto.dn.Model
      })
    },

    /**
     * Returns the complete data needed to show the channels content.
     * @param payload {proto.dn.ChannelRequest}
     * @returns {Promise} resolves to {proto.dn.ChannelModel} 
     */
    getChannelModel: function (payload) {
      qx.core.Assert.assertInstance(payload, proto.dn.ChannelRequest)
      return this._call(payload, {
        methodName: 'getChannelModel',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.ChannelRequest,
        responseType: proto.dn.ChannelModel
      })
    },

    /**
     *
     * @param payload {proto.dn.Token}
     * @returns {Promise} resolves to {proto.dn.Response} 
     */
    setFirebaseToken: function (payload) {
      qx.core.Assert.assertInstance(payload, proto.dn.Token)
      return this._call(payload, {
        methodName: 'setFirebaseToken',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Token,
        responseType: proto.dn.Response
      })
    }
  }
})
