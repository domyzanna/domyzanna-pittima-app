// This is the service worker file for handling push notifications.

self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png', // You can add an icon for your notifications
    badge: '/badge-72x72.png', // And a badge
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Optional: Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // This example focuses the user to the existing app window if one is open
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
  );
});

    