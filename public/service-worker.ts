/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'print-portal-v1';

// Add the URLs you want to cache
const urlsToCache = [
  '/',
  '/dashboard',
  '/workOrders',
  '/orders',
  '/invoices',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If the request is for a page navigation, return the offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await cache.match('/offline.html');
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // If we get here, neither network nor cache worked
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
