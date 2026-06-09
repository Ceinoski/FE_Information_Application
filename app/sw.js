/* FE Feed — service worker
 * App-shell precache + runtime cache for fonts/KaTeX so the app works offline.
 */
// Bump this version string on every deploy so clients re-cache updated files.
const VERSION = "fefeed-v5";
const SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./data/topics.js",
  "./data/cards.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isShell = url.origin === location.origin;
  const isCDN = /jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.href);

  if (isShell) {
    // cache-first for our own assets
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res;
    }).catch(() => caches.match("./index.html"))));
  } else if (isCDN) {
    // stale-while-revalidate for fonts + KaTeX
    e.respondWith(caches.open(VERSION).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
