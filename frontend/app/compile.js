function compile (data, callback) {
  if (process.env.CORDOVA) {
    console.log('building cordova app')
    data.targets.forEach(target => {
      if (!target.hasOwnProperty('environment')) {
        target.environment = {}
      }
      target.environment['app.cordova'] = true
    })
  }
  callback(null, data)
}
