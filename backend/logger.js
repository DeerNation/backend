/**
 * logger
 *
 * @author tobiasb
 * @since 2018
 */

const { format, transports, loggers } = require('winston');
const { combine, timestamp, label, printf, colorize, align, splat } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level.toUpperCase()}: ${info.message}`;
});

const defaultLoggerConfig = {
  transports: []
}

if (process.env.ENV === 'dev') {
  defaultLoggerConfig.transports.push(new transports.Console())
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
      config.format = combine(
        colorize(),
        format.padLevels(),
        label({label: module}),
        splat(),
        timestamp(),
        align(),
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