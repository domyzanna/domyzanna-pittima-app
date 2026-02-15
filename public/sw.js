// Pittima App Service Worker - PWA + Push Notifications
const CACHE_NAME = 'pittima-v1';

// Import Firebase Messaging SW - MUST match client SDK version
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Initialize Firebase in the SW
firebase.initializeApp({
  apiKey: "AIzaSyBchqpggDU6D9jJzsCORBKZDtJDowRAy-4",
  authDomain: "studio-1765347057-3bb5c.firebaseapp.com",
  projectId: "studio-1765347057-3bb5c",
  messagingSenderId: "976623372980",
  appId: "1:976623372980:web:f37952c3c22714b81de5e1",
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  console.log('Push ricevuta in background:', payload);

  const title = payload.notification?.title || 'Pittima App';
  const options = {
    body: payload.notification?.body || 'Hai scadenze in avvicinamento!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'pittima-deadline',
    renotify: true,
    data: {
      url: payload.data?.url || '/dashboard',
    },
  };

  self.registration.showNotification(title, options);
});

// Handle notification click - open the app
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
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
