"use strict";
(() => {
  // public/service-worker.ts
  var CACHE_NAME = "print-portal-v1";
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === "navigate") {
          const offlineResponse = await cache.match("/offline.html");
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        return new Response("Network error happened", {
          status: 408,
          headers: { "Content-Type": "text/plain" }
        });
      })
    );
  });
})();
