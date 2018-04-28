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

const {botUUID} = require('../util')

module.exports = {
  Actor: [{
    uid: '0x1',
    type: 0,
    username: 'admin',
    roles: [{uid: '0x13'}],
    name: 'Tobias Bräutigam',
    email: 'tbraeutigam@gmail.com',
    password: 'tester',
    color: '#ACACAC',
    locale: 'de'
  }, {
    uid: '0x2',
    type: 2,
    username: 'hirschberg',
    roles: [{uid: '0x14'}],
    name: 'Hirschberg',
    email: 'tbraeutigam@gmail.com',
    password: botUUID,
    color: '#085525'
  }, {
    uid: '0x3',
    type: 0,
    username: 'user',
    roles: [{uid: '0x12'}],
    name: 'Max Mustermann',
    email: 'tbraeutigam@gmail.com',
    password: 'tester',
    color: '#FFFF00',
    locale: 'de'
  }],
  Webhook: [
    {
      uid: '0x4',
      channel: {
        uid: '0x6'
      },
      secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
      name: 'News',
      actor: {
        uid: '0x2'
      }
    },
    {
      uid: '0x5',
      channel: {
        uid: '0x7'
      },
      secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
      name: 'Termine',
      actor: {
        uid: '0x2'
      }
    }
  ],
  Channel: [
    {
      uid: '0x6',
      id: 'hbg.channel.news.public',
      type: 'PUBLIC',
      title: 'News',
      description: 'Alle Neuigkeiten aus Hirschberg',
      owner: {
        uid: '0x1'
      },
      color: '#085525'
    },
    {
      uid: '0x7',
      id: 'hbg.channel.events.public',
      type: 'PUBLIC',
      title: 'Termine',
      description: 'Termine & Veranstaltungen in Hirschberg',
      owner: {
        uid: '0x1'
      },
      color: '#CC5525',
      typeIcon: 'event',
      view: 'calendar',
      allowedActivityTypes: ['event']
    }
  ],
  Subscription: [
    {
      uid: '0x8',
      actor: {
        uid: '0x1'
      },
      channel: {
        uid: '0x6'
      },
      favorite: true,
      desktopNotification: {
        uid: '0x26',
        type: 'all'
      },
      mobileNotification: {
        uid: '0x27',
        type: 'mentioned'
      },
      emailNotification: {
        uid: '0x28',
        type: 'none'
      }
    },
    {
      uid: '0x9',
      actor: {
        uid: '0x1'
      },
      channel: {
        uid: '0x7'
      },
      favorite: true,
      desktopNotification: {
        uid: '0x29',
        type: 'all'
      },
      mobileNotification: {
        uid: '0x30',
        type: 'mentioned'
      },
      emailNotification: {
        uid: '0x31',
        type: 'none'
      }
    }, {
      uid: '0x10',
      actor: {
        uid: '0x3'
      },
      channel: {
        uid: '0x6'
      },
      favorite: true,
      desktopNotification: {
        uid: '0x32',
        type: 'all'
      },
      mobileNotification: {
        uid: '0x33',
        type: 'mentioned'
      },
      emailNotification: {
        uid: '0x34',
        type: 'none'
      }
    }
  ],
  ACLRole: [
    {
      uid: '0x11',
      id: 'guest',
      weight: 0
    }, {
      uid: '0x12',
      id: 'user',
      parent: {uid: '0x11'},
      weight: 100
    }, {
      uid: '0x13',
      id: 'admin',
      weight: 1000
    }, {
      uid: '0x14',
      id: 'bot',
      weight: 100
    }
  ],
  ACLEntry: [
    {
      uid: '0x14',
      topic: 'hbg\\.channel\\..+\\.public.*',
      actions: 'r',
      roleTarget: {uid: '0x11'}
    },
    {
      uid: '0x15',
      topic: 'hbg\\.channel\\..+\\.public',
      actions: 'e',
      memberActions: 'lp',
      ownerActions: 'du',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x16',
      topic: 'hbg\\.channel\\..+\\.private',
      memberActions: 'rlp',
      ownerActions: 'e',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x17',
      topic: 'hbg\\.object\\..*',
      ownerActions: 'rud',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x18',
      topic: 'hbg\\.channel\\..+',
      actions: 'c',
      memberActions: 'rpl',
      ownerActions: 'ud',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x19',
      topic: 'hbg\\.channel\\..+',
      memberActions: 'p',
      roleTarget: {uid: '0x14'}
    },
    {
      uid: '0x20',
      topic: 'hbg\\.rpc\\.(login|getAllowedActions|check|getChannels|getActors|getChannelActivities)',
      actions: 'x',
      roleTarget: {uid: '0x11'}
    },
    {
      uid: '0x21',
      topic: 'hbg\\.object\\.Actor',
      actions: 'r',
      roleTarget: {uid: '0x11'}
    },
    {
      uid: '0x22',
      topic: 'hbg\\.rpc\\..*',
      actions: 'x',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x23',
      topic: 'hbg\\.object\\..*',
      actions: '',
      ownerActions: 'du',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x24',
      topic: '$INT\\.users',
      actions: 'el',
      roleTarget: {uid: '0x12'}
    },
    {
      uid: '0x25',
      topic: 'crud>publicChannels.*',
      actions: 'rel',
      roleTarget: {uid: '0x12'}
    }
  ]
}
