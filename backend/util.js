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
 * util
 *
 * @author tobiasb
 * @since 2018
 */
const uuidv4 = require('uuid/v4')
const XXHash = require('xxhash')

const botUUID = uuidv4()
module.exports.botUUID = botUUID

function normalizeActivity (activity) {
  let normalizedActivity = Object.assign({}, activity)
  delete normalizedActivity.channel
  if (normalizedActivity.hasOwnProperty('hash')) {
    delete normalizedActivity.hash
  }
  return JSON.stringify(normalizedActivity)
}

module.exports.hash = function (activity) {
  return XXHash.hash64(Buffer.from(normalizeActivity(activity), 'utf-8'), 0xCAFEBABE, 'hex')
}
