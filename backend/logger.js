/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * logger
 *
 * @author tobiasb
 * @since 2018
 */

const { format, transports, loggers } = require('winston')
const { combine, timestamp, printf, colorize, align, splat } = format
const maxModuleLength = 25

const myFormat = printf(info => {
  return info.timestamp.replace(/[T|Z]/g, '') + ' ' + info.level.toUpperCase().padEnd(5) + ' - ' + info.message
})

const defaultLoggerConfig = {
  transports: [],
  exitOnError: false
}

if (process.env.ENV === 'dev') {
  defaultLoggerConfig.transports.push(new transports.Console({
    level: 'debug',
    handleExceptions: true
  }))
} else {
  defaultLoggerConfig.transports.push(new transports.File({ filename: 'combined.log' }))
  defaultLoggerConfig.transports.push(new transports.File({
    filename: 'error.log',
    level: 'error'
  }))
}

// create the logger
if (process.env.ENV === 'dev') {
  // console.log(module, config)
  defaultLoggerConfig.format = combine(
    colorize({message: true}),
    splat(),
    timestamp(),
    myFormat
  )
} else {
  defaultLoggerConfig.format = combine(
    format.padLevels(),
    splat(),
    timestamp(),
    align(),
    myFormat
  )
}
const logger = loggers.add('nameLogger', defaultLoggerConfig)

module.exports = function (fileName) {
  // create new logger

  // normalize filename
  let parts = fileName.replace(/[/]/g, '.').split('.')
  parts.pop()
  // remove filetype
  const start = Math.max(parts.indexOf('backend'), 0)
  let labelString = parts.slice(start).join('.')

  if (labelString.length > maxModuleLength) {
    let gain = labelString.length - maxModuleLength
    let parts = labelString.split('.')
    for (let i = 0; i < parts.length; i++) {
      gain -= parts[i].length - 1
      parts[i] = parts[i].substr(0, 1)
      if (gain <= 0) {
        break
      }
    }
    labelString = parts.join('.')
  }
  labelString = `${labelString}`.padStart(maxModuleLength, '.')

  return {
    info: function (msg, vars) {
      logger.info(`[${labelString}]: ${msg}`, vars)
    },
    debug: function (msg, vars) {
      logger.debug(`[${labelString}]: ${msg}`, vars)
    },
    error: function (msg, vars) {
      logger.error(`[${labelString}]: ${msg}`, vars)
    },
    warn: function (msg, vars) {
      logger.warn(`[${labelString}]: ${msg}`, vars)
    }
  }
}
