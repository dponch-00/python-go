// Ranking entre jugadores del dispositivo, selector de jugador y creación de perfil.
import * as store from "../../engine/store.js";
import { totalPoints, totalStars, streakNow } from "../../engine/game.js";
import { levelFromXp, rankFor, DAILY_GOALS } from "../../engine/scoring.js";
import { MAX_STARS, LEVELS, WORLDS } from "../../data/worlds.js";
import { esc, fmt, toast } from "../dom.js";
import { icon, logoHtml } from "../icons.js";
import { em, avatar } from "../emoji.js";
import { sfx } from "../sfx.js";

const BOARDS = [
  { id: "points", label: "Puntos", value: (p) => totalPoints(p), unit: "pts" },
  { id: "stars", label: "Estrellas", value: (p) => totalStars(p), unit: `/ ${MAX_STARS}` },
  { id: "arcade", label: "Contrarreloj", value: (p) => p.arcade.best, unit: "pts" },
  { id: "streak", label: "Racha", value: (p) => streakNow(p).count, unit: "días" },
  { id: "xp", label: "XP", value: (p) => p.xp, unit: "XP" },
];

// ================= Ranking =================
export function rankingScreen(main, _params, app) {
  let board = BOARDS[0];
  try {
    board = BOARDS.find((b) => b.id === sessionStorage.getItem("pygo:board")) || board;
  } catch {}

  function render() {
    const players = store.listProfiles();
    const rows = players.map((p) => ({ p, v: board.value(p) })).sort((a, b) => b.v - a.v || b.p.xp - a.p.xp);
    main.innerHTML = `
      <div class="page ranking">
        <h1 class="page-title">${em("chart", "title-em")} Ranking</h1>
        <div class="seg" role="tablist" aria-label="Clasificación">
          ${BOARDS.map((b) => `<button role="tab" aria-selected="${b === board}" class="${b === board ? "on" : ""}" data-b="${b.id}">${b.label}</button>`).join("")}
        </div>
        <ol class="board">
          ${rows.map(({ p, v }, i) => `
            <li class="${p.id === app.save.id ? "me" : ""} ${i < 3 && v > 0 ? "top" + (i + 1) : ""}">
              <span class="pos">${i < 3 && v > 0 ? em(`medal${i + 1}`, "", `Lugar ${i + 1}`) : i + 1}</span>
              <span class="av">${avatar(p.avatar)}</span>
              <span class="who"><b>${esc(p.name)}</b><small>Nv ${levelFromXp(p.xp)} · ${esc(rankFor(levelFromXp(p.xp)))}</small></span>
              <span class="val"><b>${fmt(v)}</b><small>${board.unit}</small></span>
            </li>`).join("")}
        </ol>
        ${players.length < 2 ? `<div class="empty card"><p><b>¿Retas a alguien?</b> Agrega otro jugador en este dispositivo y compitan por el primer lugar.</p><button class="btn ghost small" data-act="go" data-to="onboard">${icon("plus")} Nuevo jugador</button></div>` : ""}
        <p class="muted small">El ranking incluye a los jugadores de este dispositivo. Para llevar tu progreso a otro, usa Perfil → Copia de seguridad.</p>
      </div>`;
  }
  render();
  main.addEventListener("click", (e) => {
    const b = e.target.closest("[data-b]");
    if (!b) return;
    sfx.tap();
    board = BOARDS.find((x) => x.id === b.dataset.b);
    try {
      sessionStorage.setItem("pygo:board", board.id);
    } catch {}
    render();
  });
}

// ================= ¿Quién juega? =================
export function profilesScreen(root, _params, app) {
  const players = store.listProfiles();
  if (!players.length) {
    queueMicrotask(() => app.replace("onboard"));
    return;
  }
  root.innerHTML = `
    <div class="page narrow profiles">
      <header class="page-head">
        ${app.save ? `<button class="icon-btn" data-x="back" aria-label="Volver">${icon("back")}</button>` : "<span></span>"}
        ${logoHtml()}
        <span></span>
      </header>
      <h1 class="page-title center">¿Quién juega?</h1>
      <div class="who-grid">
        ${players.map((p) => `
          <button class="who-card ${app.save?.id === p.id ? "on" : ""}" data-id="${p.id}">
            <span class="av big">${avatar(p.avatar)}</span>
            <b>${esc(p.name)}</b>
            <small>Nv ${levelFromXp(p.xp)} · ${fmt(totalPoints(p))} pts</small>
          </button>`).join("")}
        <button class="who-card add" data-act="go" data-to="onboard">
          <span class="av big">${icon("plus")}</span><b>Nuevo jugador</b><small>Empieza desde cero</small>
        </button>
      </div>
    </div>`;
  root.addEventListener("click", (e) => {
    if (e.target.closest('[data-x="back"]')) return app.back();
    const c = e.target.closest("[data-id]");
    if (!c) return;
    sfx.tap();
    app.persist(true);
    app.useProfile(store.loadProfile(c.dataset.id));
    app.replace("map");
  });
}

// ================= Nuevo jugador =================
export function onboardScreen(root, _params, app) {
  const first = store.getIndex().list.length === 0;
  let avatarCh = store.AVATARS[Math.floor(Math.random() * store.AVATARS.length)];
  let goal = 60;

  root.innerHTML = `
    <div class="page narrow onboard">
      <header class="page-head">
        ${first ? "<span></span>" : `<button class="icon-btn" data-x="back" aria-label="Volver">${icon("back")}</button>`}
        ${logoHtml()}
        <span></span>
      </header>
      ${first ? `
        <section class="pitch">
          <div class="mascot">${em("a-snake", "", "")}${em("sparkles", "spark")}</div>
          <h1>Aprende Python resolviendo acertijos</h1>
          <p class="lead">${LEVELS.length} niveles en ${WORLDS.length} mundos, desde tu primer <code class="ic">print()</code> hasta clases y decoradores. Con Python real, sin anuncios y sin conexión.</p>
          <ul class="feats">
            <li>${em("trophy")}<span><b>${LEVELS.length} niveles</b> con estrellas y jefes</span></li>
            <li>${em("laptop")}<span><b>Python real</b> en tu dispositivo</span></li>
            <li>${em("fire")}<span><b>Rachas, logros</b> y retos diarios</span></li>
          </ul>
        </section>` : `<h1 class="page-title center">Nuevo jugador</h1>`}
      <form class="card form" novalidate>
        <label class="field">
          <span>¿Cómo te llamas?</span>
          <input id="ob-name" name="name" maxlength="16" autocomplete="nickname" required placeholder="Tu nombre de jugador">
        </label>
        <fieldset class="field">
          <legend>Elige tu avatar</legend>
          <div class="avatars" role="radiogroup">
            ${store.AVATARS.map((a) => `<button type="button" role="radio" class="av-pick ${a === avatarCh ? "on" : ""}" aria-checked="${a === avatarCh}" data-av="${a}">${avatar(a)}</button>`).join("")}
          </div>
        </fieldset>
        <fieldset class="field">
          <legend>Meta diaria</legend>
          <div class="goals" role="radiogroup">
            ${DAILY_GOALS.map((g) => `<button type="button" role="radio" class="goal-pick ${g.xp === goal ? "on" : ""}" aria-checked="${g.xp === goal}" data-goal="${g.xp}"><b>${g.name}</b><small>${g.xp} XP al día</small></button>`).join("")}
          </div>
        </fieldset>
        <button class="btn primary big" type="submit">${icon("play")} Empezar a jugar</button>
      </form>
      <p class="center"><button class="link" data-act="go" data-to="backup">Tengo una copia de seguridad</button></p>
    </div>`;

  const form = root.querySelector("form");
  const nameIn = root.querySelector("#ob-name");
  root.addEventListener("click", (e) => {
    if (e.target.closest('[data-x="back"]')) return app.back();
    const av = e.target.closest("[data-av]");
    if (av) {
      sfx.pick();
      avatarCh = av.dataset.av;
      root.querySelectorAll("[data-av]").forEach((b) => {
        b.classList.toggle("on", b === av);
        b.setAttribute("aria-checked", b === av);
      });
    }
    const g = e.target.closest("[data-goal]");
    if (g) {
      sfx.pick();
      goal = +g.dataset.goal;
      root.querySelectorAll("[data-goal]").forEach((b) => {
        b.classList.toggle("on", b === g);
        b.setAttribute("aria-checked", b === g);
      });
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameIn.value.trim();
    if (!name) {
      nameIn.focus();
      toast("Escribe un nombre para tu jugador.", { icon: "user" });
      return;
    }
    sfx.good();
    app.persist(true);
    const save = store.createProfile({ name, avatar: avatarCh, goal });
    save.settings.goal = goal;
    store.persist(save, true);
    app.useProfile(save);
    app.replace("map");
  });
}
