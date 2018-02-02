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
  construct: function() {
    this.__applicationServerPublicKey = 'BMOWQznq8y5gktki-leGuQcyomWRSpg8cA_0KeB_XWWXi8irBzLTA0ZNZSWfiarRP9BhzIrAvNH67PDkAZwkBNo'
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    subscribed: {
      check: "Boolean",
      init: false
    }
  },



  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __swRegistration: null,
    __applicationServerPublicKey: null,

    init: function(pathToWorker) {

      if ('serviceWorker' in navigator && 'PushManager' in window) {
        qx.log.Logger.info(this, 'Service Worker and Push is supported');

        navigator.serviceWorker.register(pathToWorker)
          .then(swReg => {
            this.info('Service Worker is registered', swReg);

            this.__swRegistration = swReg;

            this.__swRegistration.pushManager.getSubscription()
              .then(subscription => {
                const isSubscribed = !(subscription === null);

                if (isSubscribed) {
                  this.info('User IS subscribed.');
                } else {
                  this.info('User is NOT subscribed.');
                  this.subscribeUser()
                }

              });
          })
          .catch(error => {
            this.error('Service Worker Error', error);
          });
      } else {
        this.warn('Push messaging is not supported');
      }
    },

    subscribeUser: function() {
      const applicationServerKey = this.__urlB64ToUint8Array(this.__applicationServerPublicKey);
      this.__swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })
        .then(subscription => {
          this.info('User is subscribed.');

          this.updateSubscriptionOnServer(subscription);

          this.setSubscribed(true)

        })
        .catch(function(err) {
          this.info('Failed to subscribe the user: ', err);
        });
    },

    updateSubscriptionOnServer: function(subscription) {
      // TODO: Send subscription to application server
      if (subscription) {
        console.log(subscription);
      }
    },

    __urlB64ToUint8Array: function(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  }
});