/**
 * client/public/service-worker.js
 * PWA Service Worker — Stale-While-Revalidate caching strategy
 * Registered via: serviceWorkerRegistration.js (CRA built-in)
 *
 * Caching strategy:
 *  - Static assets (JS/CSS/fonts): Cache First (long-lived)
 *  - API GET requests: Network First with 5s timeout fallback to cache
 *  - Pages: Stale-While-Revalidate
 *  - POST/PUT/DELETE: Network Only (never cache mutations)
 */

const CACHE_NAME    = 'sgh-v1';
const STATIC_CACHE  = 'sgh-static-v1';
const API_CACHE     = 'sgh-api-v1';
const API_TIMEOUT   = 5000; // 5 seconds

const STATIC_URLS = [
  '/',
  '/index.html',
  '/products',
  '/cart',
  '/offline.html',
];

// ── Install: pre-cache critical assets ─────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ──────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: intercept requests ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache non-GET requests
  if (request.method !== 'GET') return;

  // Never cache auth, payment, or upload endpoints
  if (url.pathname.match(/\/(auth|payment|upload)\//)) return;

  // API requests: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, API_TIMEOUT));
    return;
  }

  // Static assets (hashed filenames): Cache First
  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico|webp)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

// ── Caching strategies ──────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithTimeout(request, cacheName, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ message: 'Offline — cached data unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await networkPromise || caches.match('/offline.html');
}

// ── Push notifications ──────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body:    data.body    || 'You have a new notification from SGH',
    icon:    data.icon    || '/logo192.png',
    badge:   '/badge.png',
    tag:     data.tag     || 'sgh-notification',
    data:    { url: data.url || '/' },
    actions: [
      { action:'view',    title:'View' },
      { action:'dismiss', title:'Dismiss' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Style Gallery Hub', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action !== 'dismiss') {
    event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
  }
});