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
 * The ServiceWorkerHandler detects browser capabilities and loads and configures the service worker according to
 * its findings.
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.io.ServiceWorkerHandler', {
  extend: qx.core.Object,
  type: 'singleton',

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.__applicationServerPublicKey = 'BMOWQznq8y5gktki-leGuQcyomWRSpg8cA_0KeB_XWWXi8irBzLTA0ZNZSWfiarRP9BhzIrAvNH67PDkAZwkBNo'
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    subscribed: {
      check: 'Boolean',
      init: false
    },

    registration: {
      check: 'Object',
      nullable: true,
      event: 'changedRegistration'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __applicationServerPublicKey: null,

    init: function (pathToWorker) {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        qx.log.Logger.info(this, 'Service Worker and Push is supported')

        navigator.serviceWorker.register(pathToWorker)
          .then(swReg => {
            this.info('Service Worker is registered', swReg)

            this.setRegistration(swReg)

            swReg.active.postMessage({baseUrl: window.location.href})
            navigator.serviceWorker.addEventListener('message', this._handleWorkerMessage.bind(this))
          })
          .catch(error => {
            this.error('Service Worker Error', error)
          })
      } else {
        this.warn('Push messaging is not supported')
      }
    },

    /**
     * Handle incoming messages from serviceworker
     * @param event {Event}
     * @protected
     */
    _handleWorkerMessage: function (event) {
      if (event.data.hasOwnProperty('showChannel')) {
        app.Model.getInstance().selectChannel(event.data.showChannel)
      }
    },

    /**
     * @returns {Promise<ServiceWorkerRegistration>}
     */
    getWorkerRegistration: function () {
      return new Promise((resolve, reject) => {
        if (this.getRegistration()) {
          resolve(this.getRegistration())
        } else {
          let timer = qx.event.Timer.once(() => {
            reject(new Error('timeout waiting for ServiceRegistration'))
          }, this, 5000)
          let lid = this.addListener('changedRegistration', () => {
            if (this.getRegistration()) {
              resolve(this.getRegistration())
              this.removeListenerById(lid)
              timer.stop()
            }
          })
        }
      })
    }

    // subscribeUser: function () {
    //   const applicationServerKey = this.__urlB64ToUint8Array(this.__applicationServerPublicKey)
    //   this.__swRegistration.pushManager.subscribe({
    //     userVisibleOnly: true,
    //     applicationServerKey: applicationServerKey
    //   })
    //     .then(subscription => {
    //       this.info('User is subscribed.')
    //
    //       this.updateSubscriptionOnServer(subscription)
    //
    //       this.setSubscribed(true)
    //     })
    //     .catch(function (err) {
    //       this.info('Failed to subscribe the user: ', err)
    //     })
    // },
    //
    // updateSubscriptionOnServer: function (subscription) {
    //   // TODO: Send subscription to application server
    //   if (subscription) {
    //     console.log(subscription)
    //   }
    // },

    // __urlB64ToUint8Array: function (base64String) {
    //   const padding = '='.repeat((4 - base64String.length % 4) % 4)
    //   const base64 = (base64String + padding)
    //     .replace(/-/g, '+')
    //     .replace(/_/g, '/')
    //
    //   const rawData = window.atob(base64)
    //   const outputArray = new Uint8Array(rawData.length)
    //
    //   for (let i = 0; i < rawData.length; ++i) {
    //     outputArray[i] = rawData.charCodeAt(i)
    //   }
    //   return outputArray
    // }
  }
})
