
/**
 *
 * Com class generated from protobuf definition "protos/api.proto".
 * auto-generated code PLEASE DO NOT EDIT!
 * 
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
     * Retuns the complete model for the currently authenticated user.
     * The model contains:
     * - the current actor (including its subscriptions)
     * - all other Actors
     * - all public channels
     * 
     * If the user it not logged in only the public channels are returned
     * @param payload {proto.dn.Empty}
     * @param callback {Function} onMessage callback
     * @param context {Object} onMessage callback context
     * @returns {Promise} resolves to {proto.dn.Model}
     */
    getModel: function (payload, callback, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Empty)
      return this._call(payload, {
        methodName: 'getModel',
        service: this,
        requestStream: false,
        responseStream: true,
        requestType: proto.dn.Empty,
        responseType: proto.dn.Model
      }, callback, context)
    },

    /**
     * Returns the complete data needed to show the channels content.
     * @param payload {proto.dn.ChannelRequest}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.ChannelModel}
     */
    getChannelModel: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.ChannelRequest)
      return this._call(payload, {
        methodName: 'getChannelModel',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.ChannelRequest,
        responseType: proto.dn.ChannelModel
      }, context)
    },

    /**
     *
     * @param payload {proto.dn.Token}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Response}
     */
    setFirebaseToken: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Token)
      return this._call(payload, {
        methodName: 'setFirebaseToken',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Token,
        responseType: proto.dn.Response
      }, context)
    },

    /**
     * Updates a single property of an object
     * @param payload {proto.dn.PropertyUpdate}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Response}
     */
    updateProperty: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.PropertyUpdate)
      return this._call(payload, {
        methodName: 'updateProperty',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.PropertyUpdate,
        responseType: proto.dn.Response
      }, context)
    },

    /**
     * Returns concatenated string with all allowed actions for the given role on the topic
     * @param payload {proto.dn.AclRequest}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.model.AclActions}
     */
    getAllowedActionsForRole: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.AclRequest)
      return this._call(payload, {
        methodName: 'getAllowedActionsForRole',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.AclRequest,
        responseType: proto.dn.model.AclActions
      }, context)
    },

    /**
     *
     * @param payload {proto.dn.Object}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Response}
     */
    createObject: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Object)
      return this._call(payload, {
        methodName: 'createObject',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Object,
        responseType: proto.dn.Response
      }, context)
    },

    /**
     *
     * @param payload {proto.dn.Uid}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Object}
     */
    getObject: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Uid)
      return this._call(payload, {
        methodName: 'getObject',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Uid,
        responseType: proto.dn.Object
      }, context)
    },

    /**
     *
     * @param payload {proto.dn.Query}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Objects}
     */
    getObjects: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Query)
      return this._call(payload, {
        methodName: 'getObjects',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Query,
        responseType: proto.dn.Objects
      }, context)
    },

    /**
     *
     * @param payload {proto.dn.Object}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Response}
     */
    updateObject: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Object)
      return this._call(payload, {
        methodName: 'updateObject',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Object,
        responseType: proto.dn.Response
      }, context)
    },

    /**
     *
     * @param payload {proto.dn.Object}
     * @param context {Object} promise context
     * @returns {Promise} resolves to {proto.dn.Response}
     */
    deleteObject: function (payload, context) {
      qx.core.Assert.assertInstance(payload, proto.dn.Object)
      return this._call(payload, {
        methodName: 'deleteObject',
        service: this,
        requestStream: false,
        responseStream: false,
        requestType: proto.dn.Object,
        responseType: proto.dn.Response
      }, context)
    }
  }
})
