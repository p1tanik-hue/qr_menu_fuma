/* FUMA LOUNGE service worker — lightweight, cache-first for assets,
   network-first for pages, with offline fallback. */
const VERSION = 'fuma-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const PRECACHE = ['/', '/offline.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache admin or API responses.
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return;
  }

  // Cache-first for static assets and uploaded images.
  const isAsset =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/uploads') ||
    url.pathname.startsWith('/icons') ||
    /\.(?:css|js|png|jpg|jpeg|webp|avif|svg|woff2?)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Network-first for navigations, fall back to cache / offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/offline.html')),
        ),
    );
  }
});
