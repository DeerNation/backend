module.exports = {
  service: {
    '*': {
      extend: 'app.api.BaseService',
      include: [],
      implement: []
    }
  },
  messageType: {
    'proto.dn.model.Channel': {
      include: ['app.api.MChannel']
    },
    'proto.dn.model.Subscription': {
      include: ['app.api.MSubscription']
    },
    'proto.dn.model.Actor': {
      include: ['app.api.MActor']
    }
  },
  skipDeps: ['grpc-web-client.js'],
  skipDepLoadingFallback: true,
  withoutSemi: true
}