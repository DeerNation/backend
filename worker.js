require('dotenv').config()
const SCWorker = require('socketcluster/scworker')
const express = require('express')
const bodyParser = require('body-parser')
// const serveStatic = require('serve-static')
const path = require('path')
const healthChecker = require('sc-framework-health-check')
const auth = require('./backend/auth')
const i18n = require('i18n')
const ICal = require('./backend/crawler/iCal')
const cron = require('node-cron')
const logger = require('./backend/logger')(__filename)
const WebhookHandler = require('./backend/webhook/handler')
const channelHandler = require('./backend/ChannelHandler')
const dgraphService = require('./backend/model/dgraph').dgraphService
const pushNotifications = require('./backend/notification')
const pluginHandler = require('./backend/PluginHandler')
const MetadataScraper = require('./backend/MetadataScraper')
const grpcServer = require('./backend/rpc/grpc')
const dn = require('./backend/model/protos').dn

class Worker extends SCWorker {
  run () {
    logger.info('   >> Worker PID: %d', process.pid)
    const serverId = this.options.serverId
    console.log('ServerId:', serverId)

    pluginHandler.init()

    let app = express()

    i18n.configure({
      locales: ['en', 'de'],
      directory: path.join(__dirname, 'locales')
    })

    // default: using 'accept-language' header to guess language settings
    app.use(i18n.init)

    let httpServer = this.httpServer
    let scServer = this.scServer

    channelHandler.init(this.scServer)

    app.use(bodyParser.json())

    // activate Webhookhandler
    const webhookHandler = new WebhookHandler()
    webhookHandler.init(app, scServer)

    // activate scraper
    const metadataScraper = new MetadataScraper()
    metadataScraper.init(app)

    // Add GET /health-check express route
    healthChecker.attach(this, app)

    httpServer.on('request', app)

    // TODO: do not do this hard-coded, make it confugurable via GUI instead
    let iCal = new ICal('https://www.hirschberg-sauerland.de/index.php?id=373&type=150&L=0&tx_cal_controller%5Bcalendar%5D=1&tx_cal_controller%5Bview%5D=ics&cHash=b1aa5a58b6552eaba4eae2551f8d6d75', 'hirschberg')
    logger.debug('Installing iCal importer cronjob')
    cron.schedule('0 */5 * * * *', iCal.update.bind(iCal), true)

    // start listening on changes to Activities
    channelHandler.start()

    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', function (socket) {
      logger.debug('initializing gRPC')
      grpcServer.upgradeToGrpc(socket)
      grpcServer.addService(dn.Com, dgraphService)

      // activate authentification
      if (socket.authToken) {
        auth(socket, scServer)
        pushNotifications.syncTopicSubscriptions(serverId, socket.authToken.user)
      } else {
        auth(socket, scServer, pushNotifications.syncTopicSubscriptions.bind(pushNotifications, serverId))
      }

      // socket.on('disconnect', function () {
      //
      // })
    })
  }
}

// eslint-disable-next-line
new Worker()
