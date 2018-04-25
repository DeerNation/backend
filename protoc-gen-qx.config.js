module.exports = {
  service: {
    '*': {
      extend: 'app.api.BaseService',
      include: [],
      implement: []
    }
  },
  skipDeps: ['grpc-web-client.js'],
  skipDepLoadingFallback: true,
  withoutSemi: true
}