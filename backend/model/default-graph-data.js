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
  Actor: [
    {
      uid: '_:admin',
      type: 0,
      username: 'admin',
      roles: [{uid: '_:adminRole'}],
      name: 'Tobias Bräutigam',
      email: 'tbraeutigam@gmail.com',
      password: 'tester',
      color: '#ACACAC',
      locale: 'de'
    }, {
      uid: '_:hirschberg',
      type: 2,
      username: 'hirschberg',
      roles: [{uid: '_:botRole'}],
      name: 'Hirschberg',
      email: 'tbraeutigam@gmail.com',
      password: botUUID,
      color: '#085525'
    }, {
      uid: '_:max',
      type: 0,
      username: 'user',
      roles: [{uid: '_:userRole'}],
      name: 'Max Mustermann',
      email: 'tbraeutigam@gmail.com',
      password: 'tester',
      color: '#FFFF00',
      locale: 'de'
    }
  ],
  Webhook: [
    {
      identifier: 'f225a69e-5064-49b0-9c3b-0b99be51781f',
      channel: {
        uid: '_:channelNews'
      },
      secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
      name: 'News',
      actor: {
        uid: '_:hirschberg'
      }
    },
    {
      identifier: '1f9635f5-7489-4cf3-9191-c32ff754ed4a',
      channel: {
        uid: '_:channelEvents'
      },
      secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
      name: 'Termine',
      actor: {
        uid: '_:hirschberg'
      }
    }
  ],
  Channel: [
    {
      uid: '_:channelNews',
      id: 'hbg.channel.news.public',
      type: 'PUBLIC',
      title: 'News',
      description: 'Alle Neuigkeiten aus Hirschberg',
      owner: {
        uid: '_:admin'
      },
      color: '#085525'
    },
    {
      uid: '_:channelEvents',
      id: 'hbg.channel.events.public',
      type: 'PUBLIC',
      title: 'Termine',
      description: 'Termine & Veranstaltungen in Hirschberg',
      owner: {
        uid: '_:admin'
      },
      color: '#CC5525',
      typeIcon: 'event',
      view: 'calendar',
      allowedActivityTypes: ['event']
    }
  ],
  Subscription: [
    {
      actor: {
        uid: '_:admin'
      },
      channel: {
        uid: '_:channelNews'
      },
      favorite: true,
      desktopNotification: {
        type: 'all'
      },
      mobileNotification: {
        type: 'mentioned'
      },
      emailNotification: {
        type: 'none'
      }
    },
    {
      actor: {
        uid: '_:admin'
      },
      channel: {
        uid: '_:channelEvents'
      },
      favorite: true,
      desktopNotification: {
        type: 'all'
      },
      mobileNotification: {
        type: 'mentioned'
      },
      emailNotification: {
        type: 'none'
      }
    }, {
      actor: {
        uid: '_:max'
      },
      channel: {
        uid: '_:channelNews'
      },
      favorite: true,
      desktopNotification: {
        type: 'all'
      },
      mobileNotification: {
        type: 'mentioned'
      },
      emailNotification: {
        type: 'none'
      }
    }
  ],
  ACLRole: [
    {
      uid: '_:guestRole',
      id: 'guest',
      weight: 0
    }, {
      uid: '_:userRole',
      id: 'user',
      parent: {uid: '_:guestRole'},
      weight: 100
    }, {
      uid: '_:adminRole',
      id: 'admin',
      weight: 1000
    }, {
      uid: '_:botRole',
      id: 'bot',
      weight: 100
    }
  ],
  ACLEntry: [
    {
      topic: 'hbg\\.channel\\..+\\.public.*',
      actions: 'r',
      roleTarget: {uid: '_:guestRole'}
    },
    {
      topic: 'hbg\\.channel\\..+\\.public',
      actions: 'e',
      memberActions: 'lp',
      ownerActions: 'du',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'hbg\\.channel\\..+\\.private',
      memberActions: 'rlp',
      ownerActions: 'e',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'hbg\\.object\\..*',
      ownerActions: 'rud',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'hbg\\.object\\.Publication',
      actions: 'crud',
      roleTarget: {uid: '_:botRole'}
    },
    {
      topic: 'hbg\\.object\\.Publication',
      actions: 'crud',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'hbg\\.channel\\..+',
      actions: 'c',
      memberActions: 'rpl',
      ownerActions: 'ud',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'hbg\\.channel\\..+',
      memberActions: 'p',
      roleTarget: {uid: '_:botRole'}
    },
    {
      topic: 'hbg\\.rpc\\.(login|getModel|check|getChannelModel)',
      actions: 'x',
      roleTarget: {uid: '_:guestRole'}
    },
    {
      topic: 'hbg\\.object\\.Actor',
      actions: 'r',
      roleTarget: {uid: '_:guestRole'}
    },
    {
      topic: 'hbg\\.rpc\\..*',
      actions: 'x',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'hbg\\.object\\..*',
      actions: '',
      ownerActions: 'du',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: '$INT\\.users',
      actions: 'el',
      roleTarget: {uid: '_:userRole'}
    },
    {
      topic: 'crud>publicChannels.*',
      actions: 'rel',
      roleTarget: {uid: '_:userRole'}
    }
  ]
}
