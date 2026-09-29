// Mapa de mundos: un camino con forma de serpiente que atraviesa los niveles.
import { WORLDS, TYPE_LABEL } from "../../data/worlds.js";
import {
  isWorldUnlocked, isLevelUnlocked, isDone, currentLevel, worldStars,
  todayXp, dueReviews, canDoDaily,
} from "../../engine/game.js";
import { esc, fmt, modal } from "../dom.js";
import { icon, snakeHead } from "../icons.js";
import { sfx } from "../sfx.js";

const GAP = 100; // separación vertical entre niveles

function spline(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function starsHtml(n, total = 3) {
  return `<span class="mini-stars" aria-hidden="true">${Array.from({ length: total }, (_, i) => icon("star", i < n ? "on" : "")).join("")}</span>`;
}

function worldHtml(w, s, W, cur) {
  const unlocked = isWorldUnlocked(s, w);
  const stars = worldStars(s, w);
  const n = w.levels.length;
  const A = Math.min(118, Math.max(60, (W - 110) / 2));
  const phase = w.id % 2 ? 0 : Math.PI;
  const pts = w.levels.map((_, i) => [Math.round(W / 2 + A * Math.sin(i * 0.95 + phase)), 56 + i * GAP]);
  const H = 56 + (n - 1) * GAP + 70;
  const doneCount = w.levels.filter((lv) => isDone(s, lv.id)).length;
  const curIdx = cur && cur.world === w.id ? cur.index : -1;
  const reach = curIdx >= 0 ? curIdx : doneCount === n ? n - 1 : doneCount - 1;
  const full = spline(pts);
  const done = reach > 0 ? spline(pts.slice(0, reach + 1)) : "";

  const nodes = w.levels
    .map((lv, i) => {
      const r = s.levels[lv.id];
      const open = isLevelUnlocked(s, lv);
      const isCur = i === curIdx;
      const state = isCur ? "cur" : r?.done ? "done" : open ? "open" : "locked";
      const label = `Nivel ${lv.num}: ${lv.title}${r?.done ? `, ${r.stars} ${r.stars === 1 ? "estrella" : "estrellas"}` : open ? "" : ", bloqueado"}`;
      const face = isCur ? snakeHead("head") : !open ? icon("lock") : lv.boss ? icon("crown") : `<span class="n">${lv.num}</span>`;
      return `
        <button class="node ${state}${lv.boss ? " boss" : ""}" style="left:${pts[i][0]}px;top:${pts[i][1]}px"
          data-level="${lv.id}" ${open ? "" : "disabled"} aria-label="${esc(label)}">
          <span class="disc">${face}</span>
          ${r?.done ? starsHtml(r.stars) : ""}
          ${isCur ? `<span class="bubble">${i === 0 && w.id === 1 ? "¡Empieza aquí!" : "¡Sigue aquí!"}</span>` : ""}
        </button>`;
    })
    .join("");

  return `
    <section class="world ${unlocked ? "" : "locked"}" style="--h:${w.hue}" aria-label="Mundo ${w.id}: ${esc(w.name)}">
      <header class="world-head">
        <div>
          <p class="w-num">Mundo ${w.id}</p>
          <h2>${esc(w.name)}</h2>
          <p class="w-topic">${esc(w.topic)}</p>
        </div>
        <div class="w-score">
          ${unlocked ? `<span class="w-stars">${icon("star")} ${stars}<small>/${n * 3}</small></span>` : `<span class="w-lock">${icon("lock")}</span>`}
        </div>
        ${unlocked ? "" : `<p class="w-msg">Vence al jefe del Mundo ${w.id - 1} para entrar.</p>`}
      </header>
      <div class="path" style="height:${H}px">
        <svg class="snake" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
          <path class="body" d="${full}"/>
          ${done ? `<path class="body-done" d="${done}"/><path class="scales" d="${done}"/>` : ""}
        </svg>
        ${nodes}
      </div>
    </section>`;
}

function heroHtml(s, cur) {
  const goal = s.settings.goal;
  const xp = todayXp(s);
  const pct = Math.min(1, xp / goal);
  const due = dueReviews(s).length;
  const main = cur
    ? `<p class="eyebrow">Mundo ${cur.world} · Nivel ${cur.num}${cur.boss ? " · Jefe" : ""}</p>
       <h1 class="hero-title">${esc(cur.title)}</h1>
       <p class="hero-type">${esc(TYPE_LABEL[cur.t])}</p>
       <button class="btn primary big" data-level="${cur.id}" data-direct="1">${icon("play")} Jugar</button>`
    : `<p class="eyebrow">Mapa completo</p>
       <h1 class="hero-title">¡Superaste los ${WORLDS.reduce((n, w) => n + w.levels.length, 0)} niveles!</h1>
       <p class="hero-type">Busca las 3 estrellas en cada nivel o reta tu récord en Contrarreloj.</p>
       <button class="btn primary big" data-act="go" data-to="arcade">${icon("clock")} Contrarreloj</button>`;
  return `
    <section class="hero card">
      <div class="hero-main">${main}</div>
      <div class="hero-side">
        <div class="goal-ring${xp >= goal ? " met" : ""}" style="--p:${pct}" role="img" aria-label="Meta diaria: ${xp} de ${goal} XP">
          <span>${xp >= goal ? `${icon("check")}<small>¡Meta!</small>` : `${xp}<small>/${goal}</small>`}</span>
        </div>
        <p class="goal-cap">XP de hoy</p>
      </div>
      ${due || canDoDaily(s) ? `<div class="hero-chips">
        ${canDoDaily(s) ? `<button class="chip gold" data-act="go" data-to="daily">${icon("calendar")} Reto diario disponible</button>` : ""}
        ${due ? `<button class="chip" data-act="go" data-to="games">${icon("repeat")} ${due} para repasar</button>` : ""}
      </div>` : ""}
    </section>`;
}

function preview(lv, s, app) {
  const r = s.levels[lv.id];
  modal({
    cls: "level-preview",
    title: `${lv.boss ? "Jefe · " : ""}Nivel ${lv.num}`,
    body: `
      <p class="lp-title">${esc(lv.title)}</p>
      <p class="lp-type">${esc(TYPE_LABEL[lv.t])}</p>
      ${r?.done ? `<div class="lp-stats">${starsHtml(r.stars)}<span>Mejor: <b>${fmt(r.best)}</b> pts</span>${r.time != null ? `<span>${Math.round(r.time)} s</span>` : ""}</div>` : ""}`,
    actions: [
      { label: "Cerrar", kind: "ghost" },
      { label: `${icon("play")} ${r?.done ? "Jugar de nuevo" : "Jugar"}`, kind: "primary", onClick: () => app.go("level", { id: lv.id }) },
    ],
  });
}

export function mapScreen(main, _params, app) {
  const s = app.save;
  const cur = currentLevel(s);

  function render() {
    const W = Math.min(main.clientWidth || 360, 560) - 8;
    main.innerHTML = `
      <div class="map">
        ${heroHtml(s, cur)}
        ${WORLDS.map((w) => worldHtml(w, s, W, cur)).join("")}
        <p class="map-end muted">Más mundos en camino.</p>
      </div>`;
  }
  render();

  const node = main.querySelector(".node.cur");
  // Solo desplaza si el nivel actual quedó fuera de la pantalla.
  if (node) {
    requestAnimationFrame(() => {
      if (node.getBoundingClientRect().bottom > innerHeight - 100) node.scrollIntoView({ block: "center", behavior: "instant" });
    });
  }

  main.addEventListener("click", (e) => {
    const b = e.target.closest("[data-level]");
    if (!b || b.disabled) return;
    sfx.tap();
    const lv = WORLDS.flatMap((w) => w.levels).find((x) => x.id === b.dataset.level);
    if (b.dataset.direct) app.go("level", { id: lv.id });
    else preview(lv, s, app);
  });

  let t;
  const onResize = () => {
    clearTimeout(t);
    t = setTimeout(render, 150);
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}
