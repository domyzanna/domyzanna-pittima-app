// This is a basic service worker for handling push notifications.

// Listen for the 'push' event.
// This event is triggered when the service worker receives a push message from the server.
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  // We expect the push data to be a JSON string with title, body, and icon.
  const data = event.data.json();

  const title = data.title || 'Pittima App';
  const options = {
    body: data.body || 'Hai una nuova notifica.',
    icon: data.icon || '/icon-192x192.png', // A default icon
    badge: '/badge-72x72.png' // A default badge
  };

  // The waitUntil() method ensures the service worker doesn't terminate
  // until the notification is shown.
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for the 'notificationclick' event.
// This event is triggered when a user clicks on a notification.
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');

  // Close the notification.
  event.notification.close();

  // This looks at all of the clients that are currently open and
  // focuses on any that are already open.
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true // Important for matching clients on first load.
    }).then((clientList) => {
      // Check if there's a client running.
      for (const client of clientList) {
        // You can add a more specific URL check if needed.
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If no client is open, open a new one.
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
