// Minimal service worker for the PUBLIC site only (registered from
// components/public/pwa-register.tsx, mounted only in app/(public)/layout.tsx). Existing
// purely to satisfy PWA installability + give the public pages basic offline resilience —
// this is not an offline-first app, so it deliberately never touches authenticated routes.
const CACHE_NAME = "rsp-chitwan-public-shell-v1";

const APP_SHELL = [
  "/",
  "/about",
  "/contact",
  "/gunaso",
  "/gunaso/track",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

// Never intercept these — they're either authenticated (dashboard, login) or already handle
// their own caching semantics (API routes). Caching an authenticated response in a
// cache visible to any future request on the device would be a data leak, not a convenience.
const NEVER_CACHE_PREFIXES = [
  "/api/",
  "/dashboard",
  "/projects",
  "/contractors",
  "/users",
  "/settings",
  "/complaints",
  "/profile",
  "/login",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_CACHE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
