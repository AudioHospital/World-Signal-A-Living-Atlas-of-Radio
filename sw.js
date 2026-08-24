/*
 * Frequency Oasis // WORLD SIGNAL — service worker
 *
 * Strategy:
 *  - Precache the app shell (HTML/CSS/JS is a single file + manifest + icons)
 *    so the app can boot offline and show its own "no signal" state.
 *  - Cache-first for same-origin shell assets.
 *  - Network-only (never cached) for everything cross-origin: the Radio
 *    Browser directory, live audio streams, weather/sunrise/country facts,
 *    and web fonts. Caching those would either go stale instantly or,
 *    worse, try to "cache" an infinite live audio stream.
 */

const VERSION = "frequency-oasis-v2";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only ever intercept GETs to our own origin. Everything else (station
  // directory, audio streams, weather, fonts) goes straight to the network
  // untouched by the cache.
  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
