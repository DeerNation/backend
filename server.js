/*
  This is the SocketCluster master controller file.
  It is responsible for bootstrapping the SocketCluster master process.
  Be careful when modifying the options object below.
  If you plan to run SCC on Kubernetes or another orchestrator at some point
  in the future, avoid changing the environment variable names below as
  each one has a specific meaning within the SC ecosystem.
*/

const argv = require('minimist')(process.argv.slice(2))
const scHotReboot = require('sc-hot-reboot')
const fs = require('fs')
const crypto = require('crypto')
const fsUtil = require('socketcluster/fsutil')
const waitForFile = fsUtil.waitForFile
const SocketCluster = require('socketcluster')
const path = require('path')
const logger = require('./backend/logger')(__filename)

let workerControllerPath = argv.wc || process.env.SOCKETCLUSTER_WORKER_CONTROLLER
let brokerControllerPath = argv.bc || process.env.SOCKETCLUSTER_BROKER_CONTROLLER
let workerClusterControllerPath = argv.wcc || process.env.SOCKETCLUSTER_WORKERCLUSTER_CONTROLLER
let environment = process.env.ENV || 'dev'
let serverId = process.env.SERVER_ID || environment
let logLevel = (environment === 'dev' || environment === 'docker') ? 3 : 2

let options = {
  workers: Number(argv.w) || Number(process.env.SOCKETCLUSTER_WORKERS) || 1,
  brokers: Number(argv.b) || Number(process.env.SOCKETCLUSTER_BROKERS) || 1,
  port: Number(argv.p) || Number(process.env.SOCKETCLUSTER_PORT) || 6878,
  // If your system doesn't support 'uws', you can switch to 'ws' (which is slower but works on older systems).
  wsEngine: process.env.SOCKETCLUSTER_WS_ENGINE || 'sc-uws',
  appName: 'DeerNation',
  workerController: workerControllerPath || path.join(__dirname, 'worker.js'),
  brokerController: brokerControllerPath || path.join(__dirname, 'broker.js'),
  workerClusterController: workerClusterControllerPath || null,
  socketChannelLimit: Number(process.env.SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT) || 1000,
  clusterStateServerHost: argv.cssh || process.env.SCC_STATE_SERVER_HOST || null,
  clusterStateServerPort: process.env.SCC_STATE_SERVER_PORT || null,
  clusterAuthKey: process.env.SCC_AUTH_KEY || null,
  clusterInstanceIp: process.env.SCC_INSTANCE_IP || null,
  clusterInstanceIpFamily: process.env.SCC_INSTANCE_IP_FAMILY || null,
  clusterStateServerConnectTimeout: Number(process.env.SCC_STATE_SERVER_CONNECT_TIMEOUT) || null,
  clusterStateServerAckTimeout: Number(process.env.SCC_STATE_SERVER_ACK_TIMEOUT) || null,
  clusterStateServerReconnectRandomness: Number(process.env.SCC_STATE_SERVER_RECONNECT_RANDOMNESS) || null,
  crashWorkerOnError: true,
  rebootWorkerOnCrash: true,
  // If using nodemon, set this to true, and make sure that environment is 'dev'.
  killMasterOnSignal: false,
  environment: environment,
  logLevel: logLevel,
  serverId: serverId,
  host: '0.0.0.0',
  pubSubBatchDuration: 5
}
if (environment === 'production' || process.env.USE_SSL) {
  options.protocol = 'https'
  options.protocolOptions = {
    key: fs.readFileSync('/opt/psa/var/modules/letsencrypt/etc/live/app.hirschberg-sauerland.de/privkey.pem'),
    cert: fs.readFileSync('/opt/psa/var/modules/letsencrypt/etc/live/app.hirschberg-sauerland.de/cert.pem'),
    ca: fs.readFileSync('/opt/psa/var/modules/letsencrypt/etc/live/app.hirschberg-sauerland.de/chain.pem')
  }
}

let bootTimeout = Number(process.env.SOCKETCLUSTER_CONTROLLER_BOOT_TIMEOUT) || 10000
let SOCKETCLUSTER_OPTIONS

if (process.env.SOCKETCLUSTER_OPTIONS) {
  SOCKETCLUSTER_OPTIONS = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS)
}

for (let i in SOCKETCLUSTER_OPTIONS) {
  if (SOCKETCLUSTER_OPTIONS.hasOwnProperty(i)) {
    options[i] = SOCKETCLUSTER_OPTIONS[i]
  }
}

let start = function () {
  const clusterLogger = require('./backend/logger')('backend/SocketCluster.js')
  clusterLogger.info('starting SocketCluster: env=' + options.environment)
  SocketCluster.prototype.log = function (message, time) {
    clusterLogger.info(message)
  }
  const socketCluster = new SocketCluster(options)

  socketCluster.on(socketCluster.EVENT_WORKER_CLUSTER_START, function (workerClusterInfo) {
    logger.info('   >> WorkerCluster PID: %d', workerClusterInfo.pid)
  })

  if (socketCluster.options.environment === 'dev') {
    // This will cause SC workers to reboot when code changes anywhere in the app directory.
    // The second options argument here is passed directly to chokidar.
    // See https://github.com/paulmillr/chokidar#api for details.
    logger.info(`   !! The sc-hot-reboot plugin is watching for code changes in the ${__dirname} directory`)
    scHotReboot.attach(socketCluster, {
      cwd: __dirname,
      ignored: ['public', 'node_modules', 'README.md',
        'Dockerfile', 'server.js', 'broker.js', /[/\\]\./,
        '*.log', 'frontend', 'app', 'nohup.out',
        'protos/frontend'
      ]
    })
  }
}

let bootCheckInterval = Number(process.env.SOCKETCLUSTER_BOOT_CHECK_INTERVAL) || 200
let bootStartTime = Date.now()

// Detect when Docker volumes are ready.
let startWhenFileIsReady = (filePath) => {
  let errorMessage = `Failed to locate a controller file at path ${filePath} ` +
  `before SOCKETCLUSTER_CONTROLLER_BOOT_TIMEOUT`

  return waitForFile(filePath, bootCheckInterval, bootStartTime, bootTimeout, errorMessage)
}

let filesReadyPromises = [
  startWhenFileIsReady(workerControllerPath),
  startWhenFileIsReady(brokerControllerPath),
  startWhenFileIsReady(workerClusterControllerPath)
]
// try to read autKey
// filesReadyPromises.push(new Promise(function (resolve, reject) {
//   const system = r.table('System')
//   system.filter(r.row('key').eq('authKey')).run().then(function (result) {
//     if (result.length === 0) {
//       options.authKey = crypto.randomBytes(32).toString('hex')
//       system.insert({
//         key: 'authKey',
//         value: options.authKey
//       }).run()
//     } else {
//       options.authKey = result[0].value
//     }
//     resolve()
//   })
// }))

Promise.all(filesReadyPromises)
  .then(() => {
    start()
  })
  .catch((err) => {
    logger.error(err.stack)
    process.exit(1)
  })
