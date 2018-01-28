/**
 * logger
 *
 * @author tobiasb
 * @since 2018
 */

const { format, transports, loggers } = require('winston');
const { combine, timestamp, label, printf, colorize, align, splat } = format;
const maxModuleLength = 20

const myFormat = printf(info => {
  let label = info.label
  if (label.length > maxModuleLength) {
    let gain = label.length - maxModuleLength
    let parts = label.split(".")
    for (let i=0; i < parts.length; i++) {
      gain -= parts[i].length-1
      parts[i] = parts[i].substr(0, 1)
      if (gain >= 0) {
        break
      }
    }
    label = parts.join(".")
  }
  label = `[${label}]`.padStart(maxModuleLength+2, ' ')
  return `${info.timestamp} ${label} ${info.level}: ${info.message}`;
});

const defaultLoggerConfig = {
  transports: []
}

if (process.env.ENV === 'dev') {
  defaultLoggerConfig.transports.push(new transports.Console({level: 'debug'}))
} else {
  defaultLoggerConfig.transports.push(new transports.File({ filename: 'combined.log' }))
  defaultLoggerConfig.transports.push(new transports.File({
    filename: 'error.log',
    level: 'error'
  }))
}

module.exports = function(fileName) {
  if (!loggers.has(fileName)) {
    // create new logger
    let config = Object.assign({}, defaultLoggerConfig)

    // normalize filename
    let parts = fileName.replace(/[\/]/g, '.').split(".")
    parts.pop()
    // remove filetype
    let module = parts.slice(parts.indexOf('backend')).join(".")
    if (process.env.ENV === 'dev') {
      // console.log(module, config)
      config.format = combine(
        colorize({all: true}),
        label({label: module}),
        splat(),
        timestamp(),
        myFormat
      )
    } else {
      config.format = combine(
        format.padLevels(),
        label({label: module}),
        splat(),
        timestamp(),
        align(),
        myFormat
      )
    }
    return loggers.add(fileName, config)
  }
  return loggers.get(fileName)
}