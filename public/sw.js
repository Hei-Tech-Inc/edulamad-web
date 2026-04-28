/* no-op service worker placeholder for browsers requesting /sw.js */
// Top-level message listener: required for initial worker evaluation (see OneSignal workers).
self.addEventListener('message', () => {});

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Intentionally empty: network behavior remains browser default.
})
