// Service worker: la app funciona sin conexión y se puede instalar.
// La lista ASSETS y CACHE las regenera `node tools/update-sw.mjs` (ejecútalo antes de publicar).

// ASSETS:start
const CACHE = "pygo-1.1.0-b8c86d29";
const ASSETS = [
  "./",
  "css/app.css",
  "css/fonts.css",
  "fonts/figtree.woff2",
  "fonts/jetbrains-mono.woff2",
  "fonts/unbounded.woff2",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "icons/maskable-512.png",
  "icons/maskable.svg",
  "img/e/a-alien.webp",
  "img/e/a-bee.webp",
  "img/e/a-cat.webp",
  "img/e/a-chick.webp",
  "img/e/a-dog.webp",
  "img/e/a-dragon.webp",
  "img/e/a-fox.webp",
  "img/e/a-frog.webp",
  "img/e/a-ghost.webp",
  "img/e/a-koala.webp",
  "img/e/a-lion.webp",
  "img/e/a-monkey.webp",
  "img/e/a-octopus.webp",
  "img/e/a-owl.webp",
  "img/e/a-panda.webp",
  "img/e/a-parrot.webp",
  "img/e/a-penguin.webp",
  "img/e/a-rabbit.webp",
  "img/e/a-robot.webp",
  "img/e/a-snake.webp",
  "img/e/a-tiger.webp",
  "img/e/a-trex.webp",
  "img/e/a-turtle.webp",
  "img/e/a-unicorn.webp",
  "img/e/abacus.webp",
  "img/e/apple.webp",
  "img/e/bag.webp",
  "img/e/books.webp",
  "img/e/brain.webp",
  "img/e/brick.webp",
  "img/e/bulb.webp",
  "img/e/calendar.webp",
  "img/e/chart.webp",
  "img/e/check.webp",
  "img/e/compass.webp",
  "img/e/crown.webp",
  "img/e/dolls.webp",
  "img/e/fire.webp",
  "img/e/flag.webp",
  "img/e/gear.webp",
  "img/e/gem.webp",
  "img/e/glow.webp",
  "img/e/grad.webp",
  "img/e/heart.webp",
  "img/e/hourglass.webp",
  "img/e/hundred.webp",
  "img/e/joystick.webp",
  "img/e/key.webp",
  "img/e/keyboard.webp",
  "img/e/laptop.webp",
  "img/e/lock.webp",
  "img/e/map.webp",
  "img/e/medal1.webp",
  "img/e/medal2.webp",
  "img/e/medal3.webp",
  "img/e/memo.webp",
  "img/e/moon.webp",
  "img/e/muscle.webp",
  "img/e/palette.webp",
  "img/e/party.webp",
  "img/e/puzzle.webp",
  "img/e/repeat.webp",
  "img/e/rocket.webp",
  "img/e/search.webp",
  "img/e/shield.webp",
  "img/e/snowflake.webp",
  "img/e/sparkles.webp",
  "img/e/star.webp",
  "img/e/stopwatch.webp",
  "img/e/sun.webp",
  "img/e/sunrise.webp",
  "img/e/target.webp",
  "img/e/trophy.webp",
  "img/e/w1.webp",
  "img/e/w10.webp",
  "img/e/w2.webp",
  "img/e/w3.webp",
  "img/e/w4.webp",
  "img/e/w5.webp",
  "img/e/w6.webp",
  "img/e/w7.webp",
  "img/e/w8.webp",
  "img/e/w9.webp",
  "img/e/zap.webp",
  "index.html",
  "js/data/algo.js",
  "js/data/levels-1.js",
  "js/data/levels-2.js",
  "js/data/mazes.js",
  "js/data/py.js",
  "js/data/worlds.js",
  "js/engine/arcade.js",
  "js/engine/game.js",
  "js/engine/harness.py",
  "js/engine/maze.py",
  "js/engine/py-worker.js",
  "js/engine/python.js",
  "js/engine/scoring.js",
  "js/engine/store.js",
  "js/main.js",
  "js/ui/code-editor.js",
  "js/ui/confetti.js",
  "js/ui/dom.js",
  "js/ui/editor.js",
  "js/ui/emoji.js",
  "js/ui/highlight.js",
  "js/ui/icons.js",
  "js/ui/maze.js",
  "js/ui/screens/arcade.js",
  "js/ui/screens/console.js",
  "js/ui/screens/games.js",
  "js/ui/screens/home.js",
  "js/ui/screens/me.js",
  "js/ui/screens/play.js",
  "js/ui/screens/social.js",
  "js/ui/sfx.js",
  "js/vendor/codemirror.js",
  "js/version.js",
  "manifest.webmanifest",
];
// ASSETS:end

const RUNTIME = "pygo-runtime";
const RUNTIME_HOSTS = ["cdn.jsdelivr.net"];
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
    // Pyodide: archivos con versión fija, se guardan la primera vez que se usan.
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
