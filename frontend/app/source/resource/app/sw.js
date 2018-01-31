/**
 * ServiceWorker for the app. Handle push notifications and caching.
 *
 * @author tobiasb
 * @since 2018
 */

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Hirschberg';
  const options = {
    body: 'Yay it works.',
    icon: 'app/test.png',
    badge: 'app/test.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});