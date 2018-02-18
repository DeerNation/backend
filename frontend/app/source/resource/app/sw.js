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
const knownOptions = ['actions', 'badge', 'body', 'dir', 'icon', 'image', 'lang', 'renotify', 'requireInteraction', 'tag', 'vibrate', 'data']
const urlOptions = ['icon', 'badge', 'image']
const renameOptions = {
  image: 'icon'
}

const messaging = firebase.messaging()
let baseUrl = 'http://localhost:8080/'

self.addEventListener('activate', event => {
  console.log('[sw.js] activated')
  event.waitUntil(clients.claim())
})

self.addEventListener('message', function (event) {
  if (event.data.baseUrl) {
    baseUrl = event.data.baseUrl
  }
})

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[sw.js] Received background message ', payload)
  // Customize notification here
  const notificationTitle = payload.data.title
  const notificationOptions = {}
  delete payload.data.title
  let target
  knownOptions.forEach(name => {
    if (payload.data.hasOwnProperty(name) && payload.data[name]) {
      target = renameOptions.hasOwnProperty(name) ? renameOptions[name] : name
      notificationOptions[target] = payload.data[name]
      if (urlOptions.indexOf(target) >= 0 && notificationOptions[target].indexOf('/resource/app') >= 0) {
        // fix URL
        notificationOptions[target] = notificationOptions[target].substring(notificationOptions[target].indexOf('/resource/app/'))
      }
      delete payload.data[name]
    }
  })
  if (Object.keys(payload.data).length > 0) {
    notificationOptions.data = Object.assign(notificationOptions.data || {}, payload.data)
  }
  if (!notificationOptions.click_action) {
    notificationOptions.click_action = baseUrl
  }
  console.log(notificationOptions)

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close() // Android needs explicit close.
  event.waitUntil(clients.matchAll({includeUncontrolled: true})
    .then(allClients => {
      let chatClient
      allClients.some(client => {
        if (client.url === baseUrl && 'focus' in client) {
          client.focus()
          chatClient = client
          return true
        }
      })

      // If not, then open the target URL in a new window/tab.
      if (!chatClient) {
        return clients.openWindow(baseUrl)
      } else {
        return Promise.resolve(chatClient)
      }
    })
    .then(chatClient => {
      chatClient.postMessage({showChannel: event.notification.data.channelId})
      return Promise.resolve(true)
    })
  )
})
