/* eslint-env serviceworker */
/**
 * ServiceWorker for the app. Handle push notifications and caching.
 *
 * @author tobiasb
 * @since 2018
 * @global(firebase)
 */
importScripts('../js/firebase-app.js')
importScripts('../js/firebase-messaging.js')
let config = {
  messagingSenderId: '1022981480494'
}
firebase.initializeApp(config)

const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  // Customize notification here
  const notificationTitle = payload.data.title
  delete payload.data.title
  const notificationOptions = {
    body: payload.data.message
  }
  delete payload.data.message
  Object.assign(notificationOptions, payload.data)

  return self.registration.showNotification(notificationTitle, notificationOptions)
})
