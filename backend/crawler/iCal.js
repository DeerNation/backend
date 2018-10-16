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
  constructor (file) {
    this.__uri = file
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

  update () {
    logger.info('update iCal events from %s', this.__uri)
    this.parse().then(data => {
      let now = new Date()

      for (let k in data) {
        if (data.hasOwnProperty(k)) {
          let ev = data[k]
          if (ev.type === 'VEVENT' && ev.start >= now) {
            let event = {
              ref: {
                id: ev.uid,
                type: 'ics',
                original: ev
              },
              type: 'event',
              content: {
                name: ev.summary,
                categories: ev.categories,
                description: ev.description,
                start: moment(ev.start).format(),
                end: moment(ev.end).format()
              }
            }
            if (ev.location) {
              event.content.location = ev.location
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
              event.content.organizer = orga
            }
            channelHandler.publish({user: '135dd849-9cb6-466a-9a2b-688ae21b6cdf'}, 'hbg.channel.events.public', event)
          }
        }
      }
    }).catch(err => {
      logger.error(err);
    })
  }
}

module.exports = ICal
