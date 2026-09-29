// Arranque, navegación entre pantallas y barra superior.
import * as store from "./engine/store.js";
import { streakNow, todayXp, dueReviews } from "./engine/game.js";
import { levelProgress, rankFor } from "./engine/scoring.js";
import { $, esc, fmt, modal, toast, reducedMotion } from "./ui/dom.js";
import { icon, logoHtml } from "./ui/icons.js";
import { em, avatar, ACH_EM } from "./ui/emoji.js";
import { configureSfx, sfx } from "./ui/sfx.js";
import { confetti } from "./ui/confetti.js";
import { mapScreen } from "./ui/screens/home.js";
import { gamesScreen } from "./ui/screens/games.js";
import { levelScreen, resultScreen } from "./ui/screens/play.js";
import { arcadeScreen, dailyScreen } from "./ui/screens/arcade.js";
import { consoleScreen } from "./ui/screens/console.js";
import { rankingScreen, profilesScreen, onboardScreen } from "./ui/screens/social.js";
import { meScreen, shopScreen, settingsScreen, backupScreen } from "./ui/screens/me.js";

export { VERSION } from "./version.js";

const TABS = [
  { route: "map", label: "Mapa", icon: "map" },
  { route: "games", label: "Juegos", icon: "gamepad" },
  { route: "console", label: "Consola", icon: "terminal" },
  { route: "ranking", label: "Ranking", icon: "chart" },
  { route: "me", label: "Perfil", icon: "user" },
];

const SCREENS = {
  map: { tab: true, render: mapScreen },
  games: { tab: true, render: gamesScreen },
  console: { tab: true, render: consoleScreen },
  ranking: { tab: true, render: rankingScreen },
  me: { tab: true, render: meScreen },
  level: { render: levelScreen },
  result: { render: resultScreen },
  arcade: { render: arcadeScreen },
  daily: { render: dailyScreen },
  shop: { render: shopScreen },
  settings: { render: settingsScreen },
  backup: { render: backupScreen, guest: true },
  profiles: { render: profilesScreen, guest: true },
  onboard: { render: onboardScreen, guest: true },
};

const root = document.getElementById("app");
let cleanup = null;
let current = null;

export const app = {
  save: null,
  transient: null, // datos de paso entre pantallas (p. ej. el resultado de un nivel)

  go(route, params = {}) {
    history.pushState({ route, params }, "");
    show(route, params);
  },
  replace(route, params = {}) {
    history.replaceState({ route, params }, "");
    show(route, params);
  },
  back(fallback = "map") {
    if (history.state && history.length > 1 && current?.route !== fallback) history.back();
    else app.replace(fallback);
  },
  persist(now = false) {
    if (app.save) store.persist(app.save, now);
  },
  useProfile(save) {
    app.save = save;
    store.setActive(save.id);
    app.applySettings();
  },
  applySettings() {
    const st = app.save?.settings;
    const html = document.documentElement;
    if (!st) return;
    if (st.theme === "auto") html.removeAttribute("data-theme");
    else html.dataset.theme = st.theme;
    html.dataset.code = st.codeTheme;
    html.style.setProperty("--code-size", st.codeSize + "px");
    configureSfx({ sound: st.sound, vibe: st.vibe });
    const dark = st.theme === "dark" || (st.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    $('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0A111C" : "#F2F4F8");
  },
  hud() {
    const s = app.save;
    const box = $(".hud");
    if (!s || !box) return;
    const st = streakNow(s);
    const lp = levelProgress(s.xp);
    box.querySelector("[data-hud=avatar]").innerHTML = avatar(s.avatar);
    box.querySelector("[data-hud=streak]").innerHTML = `${em("fire")}<b>${st.count}</b>`;
    box.querySelector("[data-hud=streak]").classList.toggle("cold", !st.today);
    box.querySelector("[data-hud=gems]").innerHTML = `${em("gem")}<b>${fmt(s.gems)}</b>`;
    box.querySelector("[data-hud=lvl]").innerHTML = `<span class="ring" style="--p:${lp.pct}"></span><b>Nv ${lp.level}</b>`;
    const rail = $(".rail");
    if (rail) rail.innerHTML = railHtml();
  },
  // Muestra logros, meta diaria y subida de nivel tras una recompensa.
  celebrate(sum) {
    if (!sum) return;
    sum.achievements?.forEach((a, i) =>
      setTimeout(() => {
        sfx.coin();
        toast(`Logro: <b>${esc(a.name)}</b>${a.gems ? ` · +${a.gems} ${em("gem")}` : ""}`, { emoji: ACH_EM[a.id] || "trophy", kind: "gold" });
      }, 400 + i * 900)
    );
    if (sum.goalReached) setTimeout(() => toast("¡Meta diaria cumplida!", { emoji: "target", kind: "good" }), 200);
    if (sum.usedFreeze) toast(`Tu protector de racha salvó ${sum.usedFreeze === 1 ? "un día" : sum.usedFreeze + " días"}`, { emoji: "shield" });
    if (sum.levelUp) {
      setTimeout(() => {
        document.querySelectorAll(".modal-wrap.levelup").forEach((m) => m.remove());
        sfx.levelup();
        confetti(140);
        const lp = levelProgress(app.save.xp);
        modal({
          cls: "levelup",
          title: "¡Subiste de nivel!",
          body: `${em("party", "lvl-party")}<div class="lvl-big">${lp.level}</div><p class="center">Ahora eres <b>${esc(rankFor(lp.level))}</b>.</p>`,
          actions: [{ label: "¡Genial!", kind: "primary" }],
        });
      }, 700);
    }
  },
};

function railHtml() {
  const s = app.save;
  const goal = s.settings.goal;
  const xp = todayXp(s);
  const pct = Math.min(1, xp / goal);
  const st = streakNow(s);
  const due = dueReviews(s).length;
  return `
    <section class="card rail-card">
      <h3>Meta diaria</h3>
      <div class="goal-row"><div class="goal-ring" style="--p:${pct}"><span>${Math.min(100, Math.round(pct * 100))}%</span></div>
      <p><b>${xp}</b> / ${goal} XP hoy</p></div>
    </section>
    <section class="card rail-card">
      <h3>Racha</h3>
      <p class="rail-streak ${st.today ? "" : "cold"}">${em("fire")} <b>${st.count}</b> ${st.count === 1 ? "día" : "días"}</p>
      <p class="muted">${st.today ? "Ya jugaste hoy. ¡Vuelve mañana!" : "Completa un nivel hoy para mantenerla."}</p>
    </section>
    ${due ? `<section class="card rail-card"><h3>Repaso</h3><p>${due} ${due === 1 ? "nivel listo" : "niveles listos"} para repasar.</p><button class="btn small" data-act="go" data-to="games">Repasar</button></section>` : ""}`;
}

function shellHtml(route) {
  return `
    <div class="shell">
      <nav class="tabbar" aria-label="Secciones">
        <div class="brand">${logoHtml()}</div>
        ${TABS.map((t) => `<button class="tab${t.route === route ? " on" : ""}" data-act="go" data-to="${t.route}" ${t.route === route ? 'aria-current="page"' : ""}>${icon(t.icon)}<span>${t.label}</span></button>`).join("")}
      </nav>
      <div class="col">
        <header class="hud">
          <button class="hud-avatar" data-hud="avatar" data-act="go" data-to="profiles" aria-label="Cambiar de jugador"></button>
          <div class="hud-brand">${logoHtml()}</div>
          <div class="hud-stats">
            <button class="pill streak" data-hud="streak" data-act="go" data-to="me" aria-label="Racha de días"></button>
            <button class="pill gems" data-hud="gems" data-act="go" data-to="shop" aria-label="Gemas: abrir tienda"></button>
            <button class="pill lvl" data-hud="lvl" data-act="go" data-to="me" aria-label="Nivel de jugador"></button>
          </div>
        </header>
        <main class="tab-main" id="main"></main>
      </div>
      <aside class="rail" aria-label="Resumen del día"></aside>
    </div>`;
}

function show(route, params = {}) {
  if (!SCREENS[route]) route = "map";
  const def = SCREENS[route];
  if (!def.guest && !app.save) route = "profiles";
  const first = !current;
  const swap = () => {
    cleanup?.();
    cleanup = null;
    current = { route, params };
    document.body.dataset.route = route;
    window.scrollTo(0, 0);
    if (SCREENS[route].tab) {
      root.innerHTML = shellHtml(route);
      app.hud();
      cleanup = SCREENS[route].render($("#main"), params, app) || null;
    } else {
      root.innerHTML = `<div class="full"></div>`;
      cleanup = SCREENS[route].render(root.firstElementChild, params, app) || null;
    }
  };
  if (!first && document.startViewTransition && !reducedMotion() && !document.hidden) {
    // Si la transición se salta (p. ej. dos cambios seguidos), la pantalla igual se muestra.
    const vt = document.startViewTransition(swap);
    for (const pr of [vt.ready, vt.finished, vt.updateCallbackDone]) pr?.catch(() => {});
  } else swap();
}

// Navegación declarativa: cualquier elemento con data-act="go" data-to="ruta".
root.addEventListener("click", (e) => {
  const b = e.target.closest('[data-act="go"]');
  if (!b) return;
  sfx.tap();
  const to = b.dataset.to;
  if (current?.route === to) return;
  const params = b.dataset.params ? JSON.parse(b.dataset.params) : {};
  if (SCREENS[to]?.tab && SCREENS[current?.route]?.tab) app.replace(to, params);
  else app.go(to, params);
});

window.addEventListener("popstate", (e) => {
  const st = e.state;
  show(st?.route || "map", st?.params || {});
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") store.flush(app.save);
});
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => app.applySettings());

// ---------- Service worker (instalable y sin conexión) ----------
function registerSW() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    const offer = (w) => {
      modal({
        title: "Nueva versión disponible",
        body: "<p>Hay mejoras listas. Actualiza para usarlas; tu progreso se conserva.</p>",
        actions: [
          { label: "Después", kind: "ghost" },
          { label: "Actualizar", kind: "primary", onClick: () => w.postMessage("skipWaiting") },
        ],
      });
    };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w?.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) offer(w);
      });
    });
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    store.flush(app.save);
    location.reload();
  });
}

// ---------- Inicio ----------
function boot() {
  history.scrollRestoration = "manual"; // cada pantalla decide su desplazamiento
  store.askPersistence();
  const idx = store.getIndex();
  const save = idx.active ? store.loadProfile(idx.active) : null;
  if (save) app.useProfile(save);
  const start = save ? "map" : idx.list.length ? "profiles" : "onboard";
  history.replaceState({ route: start, params: {} }, "");
  show(start);
  registerSW();
}

boot();
