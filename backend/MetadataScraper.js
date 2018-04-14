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
const schema = require('./model/schema')
const {hash} = require('./util')

class MetadataScraper {
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

    // allow CORS
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    let targetUrl = parts.join('/')
    if (!targetUrl) {
      res.sendStatus(404)
    } else {
      if (targetUrl.endsWith(('/'))) {
        // remove trailing slash
        targetUrl = targetUrl.substring(0, targetUrl.length - 1)
      }
      const urlHash = hash(targetUrl)
      try {
        const cached = await schema.getModel('LinkMetadata').get(urlHash).run()
        res.json(cached)
      } catch (e) {
        logger.debug('incoming scraper request for url: "%s"', targetUrl)
        const {body: html, url} = await got(targetUrl)
        const metadata = await metascraper({html, url})
        schema.getModel('LinkMetadata').save(Object.assign(metadata, {
          id: urlHash,
          fetched: new Date()
        }), {conflict: 'replace'})
        res.json(metadata)
      }
    }
  }
}

module.exports = MetadataScraper
