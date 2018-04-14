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
 * Extract open graph metadata from urls
 *
 * @author tobiasb
 * @since 2018
 */
const logger = require('./logger')(__filename)
const metascraper = require('metascraper')
const got = require('got')

class MetadataScraper {
  constructor () {
    this.__cache = {}
  }

  init (app) {
    app.get('/meta/*', this._handleGet.bind(this))
  }

  /**
   * Handle webhook verification request send by facebooks graph api
   * {@link https://developers.facebook.com/docs/graph-api/webhooks#verification}
   *
   * @param req
   * @param res
   * @returns {Promise<void>}
   * @private
   */
  async _handleGet (req, res) {
    let parts = req.path.substring(1).split('/')

    // remove meta
    parts.shift()

    // get webhook ID
    const targetUrl = parts.join('/')
    if (!targetUrl) {
      res.sendStatus(404)
    } else {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      // TODO: cache must be moved from memory to database
      if (this.__cache.hasOwnProperty(targetUrl)) {
        res.json(this.__cache[targetUrl])
      } else {
        logger.debug('incoming scraper request for url: "%s"', targetUrl)
        const {body: html, url} = await got(targetUrl)
        const metadata = await metascraper({html, url})
        this.__cache[targetUrl] = metadata
        res.json(metadata)
      }
    }
  }
}

module.exports = MetadataScraper
