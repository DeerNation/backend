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

const bcrypt = require('bcryptjs')
const {botUUID} = require('../util')

module.exports = {
  Actor: [{
    id: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
    type: 'Person',
    username: 'admin',
    role: 'admin',
    name: 'Tobias Bräutigam',
    email: 'tbraeutigam@gmail.com',
    password: bcrypt.hashSync('tester', 8),
    color: '#ACACAC',
    locale: 'de'
  }, {
    id: '135dd849-9cb6-466a-9a2b-688ae21b6cdf',
    type: 'Bot',
    username: 'hirschberg',
    role: 'bot',
    name: 'Hirschberg',
    email: 'tbraeutigam@gmail.com',
    password: bcrypt.hashSync(botUUID, 8),
    color: '#085525'
  }, {
    id: '39c83094-aaee-44bf-abc3-65281cc932dc',
    type: 'Person',
    username: 'user',
    role: 'user',
    name: 'Max Mustermann',
    email: 'tbraeutigam@gmail.com',
    password: bcrypt.hashSync('tester', 8),
    color: '#FFFF00',
    locale: 'de'
  }],
  Webhook: [
    {
      id: '5618e6a6-6d62-4689-8900-44b82b2a7523',
      channel: 'hbg.channel.news.public',
      secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
      name: 'News',
      actorId: '135dd849-9cb6-466a-9a2b-688ae21b6cdf'
    },
    {
      id: 'f1104eed-782c-4b0a-89d8-910cfa1de1c5',
      channel: 'hbg.channel.events.public',
      secret: 'e802f7b0-224e-4437-a2dd-ac27933bc9a7',
      name: 'Termine',
      actorId: '135dd849-9cb6-466a-9a2b-688ae21b6cdf'
    }
  ],
  Channel: [
    {
      id: 'hbg.channel.news.public',
      type: 'PUBLIC',
      title: 'News',
      description: 'Alle Neuigkeiten aus Hirschberg',
      ownerId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
      color: '#085525'
    },
    {
      id: 'hbg.channel.events.public',
      type: 'PUBLIC',
      title: 'Termine',
      description: 'Termine & Veranstaltungen in Hirschberg',
      ownerId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
      color: '#CC5525',
      typeIcon: 'event',
      view: 'calendar',
      allowedActivityTypes: ['event']
    }
  ],
  Subscription: [
    {
      id: 'f2edfa36-c431-42f8-bc69-c0b060d941dc',
      actorId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
      channelId: 'hbg.channel.news.public',
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
      id: '57ac49a7-2dc7-4997-8dbc-335f81cfad4b',
      actorId: '0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a',
      channelId: 'hbg.channel.events.public',
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
      id: '55995e7e-e3e4-4af7-b766-dfd6a91a0ba8',
      actorId: '39c83094-aaee-44bf-abc3-65281cc932dc',
      channelId: 'hbg.channel.news.public',
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
      id: 'guest',
      weight: 0
    }, {
      id: 'user',
      parent: 'guest',
      members: ['39c83094-aaee-44bf-abc3-65281cc932dc'],
      weight: 100
    }, {
      id: 'admin',
      members: ['0e4a6f6f-cc0c-4aa5-951a-fcfc480dd05a'],
      weight: 1000
    }, {
      id: 'bot',
      weight: 100
    }
  ],
  ACLEntry: [
    {
      id: 'f357da38-c0b4-4071-afcf-1b33da16636b',
      topic: 'hbg\\.channel\\..+\\.public.*',
      actions: 'r',
      targetType: 'role',
      target: 'guest'
    },
    {
      id: 'c1ff521c-2633-4bac-9a55-344d9630cf06',
      topic: 'hbg\\.channel\\..+\\.public',
      actions: 'e',
      memberActions: 'lp',
      ownerActions: 'du',
      targetType: 'role',
      target: 'user'
    },
    {
      id: 'bbfb3075-633e-40bc-adf4-8d0a470dd954',
      topic: 'hbg\\.channel\\..+\\.private',
      memberActions: 'rlpf',
      ownerActions: 'ei',
      targetType: 'role',
      target: 'user'
    },
    {
      id: 'cda76f47-1061-4225-a079-c4552510db3b',
      topic: 'hbg\\.object\\..*',
      ownerActions: 'rud',
      targetType: 'role',
      target: 'user'
    },
    {
      id: '22c3ab14-dd93-414b-87c4-c0d0c9245cd6',
      topic: 'hbg\\.channel\\..+',
      actions: 'c',
      memberActions: 'rpl',
      ownerActions: 'ud',
      targetType: 'role',
      target: 'user'
    },
    {
      id: '755d7d16-fa30-424a-ac3f-4d7ac8f62fde',
      topic: 'hbg\\.channel\\..+',
      memberActions: 'p',
      targetType: 'role',
      target: 'bot'
    },
    {
      id: '3fa41d14-e3bf-4bb9-b221-f69e16e2f153',
      topic: 'hbg\\.rpc\\.(login|getAllowedActions|check|getChannels|getActors|getChannelActivities)',
      actions: 'x',
      targetType: 'role',
      target: 'guest'
    },
    {
      id: '08555f49-1738-4ddb-afda-4f3d1d33b6e6',
      topic: 'hbg\\.object\\.Actor',
      actions: 'r',
      targetType: 'role',
      target: 'guest'
    },
    {
      id: 'f894d70e-3aef-45ef-ac7b-53ea352f0869',
      topic: 'hbg\\.rpc\\..*',
      actions: 'x',
      targetType: 'role',
      target: 'user'
    },
    {
      id: '0e09cda6-fdca-4589-8929-3605943ba531',
      topic: 'hbg\\.object\\..*',
      actions: '',
      ownerActions: 'du',
      targetType: 'role',
      target: 'user'
    },
    {
      id: '2c55607a-9b52-4193-bead-1c1cb86f084a',
      topic: '$INT\\.users',
      actions: 'el',
      targetType: 'role',
      target: 'user'
    },
    {
      id: 'ca68d6d3-851a-4aa0-832d-d3077dd2e0e1',
      topic: 'crud>publicChannels.*',
      actions: 'rel',
      targetType: 'role',
      target: 'user'
    }
  ]
}