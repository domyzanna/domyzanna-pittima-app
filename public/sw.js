// Pittima App Service Worker - PWA + Web Push Notifications
const CACHE_NAME = 'pittima-v2';

// Handle push events (web-push native)
self.addEventListener('push', (event) => {
  console.log('Push received');
  
  let data = { title: 'Pittima App', body: 'Hai scadenze in avvicinamento!', url: '/dashboard' };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || 'pittima-deadline',
    renotify: true,
    data: { url: data.url || '/dashboard' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
  
  // Notify foreground clients
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({ type: 'PUSH_RECEIVED', ...data });
      });
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// PWA lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
