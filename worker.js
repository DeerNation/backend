const SCWorker = require('socketcluster/scworker');
const fs = require('fs');
const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const morgan = require('morgan');
const healthChecker = require('sc-framework-health-check');
const schema = require('./backend/model/schema')
const auth = require('./backend/auth')
const i18n = require("i18n")
const ICal = require('./backend/crawler/iCal')
const cron = require('node-cron');
const logger = require('./backend/logger')(__filename)

class Worker extends SCWorker {
  run() {
    logger.info('   >> Worker PID: %d', process.pid);
    let environment = this.options.environment;

    let app = express();

    i18n.configure({
      locales:['en', 'de'],
      directory: __dirname + '/locales'
    });
    // default: using 'accept-language' header to guess language settings
    app.use(i18n.init);

    let httpServer = this.httpServer;
    let scServer = this.scServer;

    // Create/Update RethinkDB schema
    let crud = schema.create(scServer)

    if (environment === 'dev') {
      // Log every HTTP request. See https://github.com/expressjs/morgan for other
      // available formats.
      // app.use(morgan('dev'));
      app.use(serveStatic(path.resolve(__dirname, 'frontend/app/source-output')));
    } else {
      app.use(serveStatic(path.resolve(__dirname, 'frontend/app/build-output/app')));
    }


    // Add GET /health-check express route
    healthChecker.attach(this, app);

    httpServer.on('request', app);

    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', function (socket) {
      // activate authentification
      auth(socket, scServer)

      let iCal = new ICal('index.ics', crud.models)
      // let iCal = new ICal('https://www.hirschberg-sauerland.de/index.php?id=373&type=150&L=0&tx_cal_controller%5Bcalendar%5D=1&tx_cal_controller%5Bview%5D=ics&cHash=b1aa5a58b6552eaba4eae2551f8d6d75', {}, function(err, data) {

      logger.debug('Installing iCal importer cronjob')
      cron.schedule('0 0 * * * *', iCal.update.bind(iCal), true)

      // Some sample logic to show how to handle client events,
      // replace this with your own logic

      // socket.on('hbg.rpc.getNews', function () {
      //   scServer.exchange.publish('hbg.channel.news', events.slice(0, 10));
      // });
      let interval

      const r = scServer.thinky.r
      r.table('Event').orderBy(r.desc('start')).run().then((events) => {
        let index = 0
        interval = setInterval(function () {
          if (index >= events.length) {
            clearInterval(interval);
          } else {
            events[index]['__jsonclass__'] = 'app.model.Event'
            scServer.exchange.publish('hbg.channel.news', events[index]);
            index++;
          }
        }, 3000);
      })

      socket.on('disconnect', function () {
        if (interval) {
          clearInterval(interval);
        }
      });
    });
  }
}

new Worker();
