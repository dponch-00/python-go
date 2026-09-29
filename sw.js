// Service worker: la app funciona sin conexión y se puede instalar.
// La lista ASSETS y CACHE las regenera `node tools/update-sw.mjs` (ejecútalo antes de publicar).

// ASSETS:start
const CACHE = "pygo-1.0.0-792221c1";
const ASSETS = [
  "./",
  "css/app.css",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "icons/maskable-512.png",
  "icons/maskable.svg",
  "index.html",
  "js/data/levels-1.js",
  "js/data/levels-2.js",
  "js/data/py.js",
  "js/data/worlds.js",
  "js/engine/arcade.js",
  "js/engine/game.js",
  "js/engine/harness.py",
  "js/engine/py-worker.js",
  "js/engine/python.js",
  "js/engine/scoring.js",
  "js/engine/store.js",
  "js/main.js",
  "js/ui/confetti.js",
  "js/ui/dom.js",
  "js/ui/editor.js",
  "js/ui/highlight.js",
  "js/ui/icons.js",
  "js/ui/screens/arcade.js",
  "js/ui/screens/console.js",
  "js/ui/screens/games.js",
  "js/ui/screens/home.js",
  "js/ui/screens/me.js",
  "js/ui/screens/play.js",
  "js/ui/screens/social.js",
  "js/ui/sfx.js",
  "js/version.js",
  "manifest.webmanifest",
];
// ASSETS:end

const RUNTIME = "pygo-runtime";
const RUNTIME_HOSTS = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
// En localhost se pide primero a la red para ver los cambios al instante (y la caché queda de respaldo).
const LOCAL_DEV = ["localhost", "127.0.0.1"].includes(location.hostname);

// Publicado: primero la caché; la actualización llega con una nueva versión de este archivo.
async function cacheFirst(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  if (req.mode === "navigate") {
    const shell = await caches.match("./");
    if (shell) return shell;
  }
  return fetch(req);
}

async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: "no-store" });
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  } catch {
    return (await caches.match(req, { ignoreSearch: true })) || (await caches.match("./"));
  }
}

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(LOCAL_DEV ? networkFirst(req) : cacheFirst(req));
    return;
  }

  if (RUNTIME_HOSTS.includes(url.hostname)) {
    // Pyodide y tipografías: archivos con versión fija, se guardan la primera vez que se usan.
    e.respondWith(
      caches.open(RUNTIME).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") c.put(req, res.clone());
        return res;
      })
    );
  }
});
