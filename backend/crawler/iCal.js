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
 * iCal importer. Parses ICS files from path or URL and saves the events in the database.
 *
 * @author tobiasb
 * @since 2018
 */
const iCal = require('node-ical')
const channelHandler = require('../ChannelHandler')
const moment = require('moment')
const logger = require('../logger')(__filename)

class ICal {
  constructor (file, username) {
    this.__uri = file
    this.__uid = null
    this.__username = username
    this._dgraphService = null
  }

  parse () {
    if (this.__uri.startsWith('http')) {
      return new Promise((resolve, reject) => {
        iCal.fromURL(this.__uri, {}, (err, data) => {
          if (err) {
            reject(new Error(err))
          } else {
            resolve(data)
          }
        })
      })
    } else {
      return Promise.resolve(iCal.parseFile(this.__uri))
    }
  }

  async update () {
    if (!this._dgraphService) {
      this._dgraphService = require('../model/dgraph').dgraphService
    }
    if (!this.__uid) {
      this.__uid = await this._dgraphService.getActorUid(this.__username)
    }
    if (!this.__uid) {
      logger.error('actor uid no found for user %s', this.__username)
    }
    logger.info('update iCal events from %s', this.__uri)
    this.parse().then(data => {
      let now = new Date()
      for (let k in data) {
        if (data.hasOwnProperty(k)) {
          let ev = data[k]
          if (ev.type === 'VEVENT' && ev.start >= now) {
            let event = {
              type: 'event',
              payload: {
                name: ev.summary,
                start: moment(ev.start).format(),
                end: moment(ev.end).format()
              },
              ref: {
                id: ev.uid,
                type: 'ics',
                original: ev
              }
            }
            if (ev.description) {
              event.payload.description = ev.description
            }
            if (ev.categories) {
              event.payload.categories = ev.categories
            }
            if (ev.location) {
              event.payload.location = ev.location
            }
            if (ev.hasOwnProperty('organizer')) {
              let orga = ev.organizer.params.CN.trim()
              if (ev.organizer.val) {
                orga += ' ' + ev.organizer.val.trim()
              }
              if (orga.endsWith(':')) {
                orga = orga.substring(0, orga.length - 1)
              }
              orga = orga.substring(1, orga.length - 1)
              event.payload.organizer = orga
            }
            // TODO this should no be hardcoded
            channelHandler.publish({user: this.__uid}, 'hbg.channel.events.public', event)
          }
        }
      }
    }).catch(err => {
      logger.error(err)
    })
  }
}

module.exports = ICal
