const SW_VERSION = "v1";
const SHELL_CACHE = `craps-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `craps-runtime-${SW_VERSION}`;
const SHELL_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function networkThenCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function cacheThenNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  // Keep HTML fresh but available offline.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      networkThenCache(request, RUNTIME_CACHE).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        return (
          (await cache.match("/index.html")) ||
          (await cache.match("/"))
        );
      })
    );
    return;
  }

  // Prefer fresh JS/CSS updates while still supporting offline usage.
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(
      networkThenCache(request, RUNTIME_CACHE).catch(async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const runtimeHit = await cache.match(request);
        if (runtimeHit) return runtimeHit;
        const shell = await caches.open(SHELL_CACHE);
        return shell.match(request);
      })
    );
    return;
  }

  // Static media/fonts: cache-first for snappy repeat loads and offline.
  if (
    request.destination === "image" ||
    request.destination === "audio" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheThenNetwork(request, RUNTIME_CACHE));
    return;
  }
});
