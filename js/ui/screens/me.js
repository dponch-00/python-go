// Perfil, tienda, ajustes y copia de seguridad.
import * as store from "../../engine/store.js";
import {
  ACHIEVEMENTS, CODE_THEMES, FREEZE_COST, FREEZE_MAX, buyFreeze, buyTheme,
  totalPoints, totalStars, streakNow, accuracy, worldStars, isWorldUnlocked, completedCount,
} from "../../engine/game.js";
import { levelProgress, rankFor, DAILY_GOALS } from "../../engine/scoring.js";
import { WORLDS, MAX_STARS, LEVELS } from "../../data/worlds.js";
import { ensurePython, onPythonStatus, pythonStatus } from "../../engine/python.js";
import { esc, fmt, toast, confirmBox, copyText } from "../dom.js";
import { icon } from "../icons.js";
import { em, avatar, ACH_EM } from "../emoji.js";
import { codeBlock } from "../highlight.js";
import { sfx } from "../sfx.js";
import { VERSION } from "../../version.js";

const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function hoursText(sec) {
  const m = Math.round(sec / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

// XP de los últimos 7 días: una sola serie, barras con base común y línea de meta.
function weekChart(s) {
  const today = store.dayKey();
  const days = Array.from({ length: 7 }, (_, i) => store.addDays(today, i - 6));
  const vals = days.map((d) => s.days[d] || 0);
  const goal = s.settings.goal;
  const max = Math.max(goal * 1.25, ...vals, 10);
  const pct = (v) => (v / max) * 100;
  return `
    <figure class="week" aria-labelledby="week-cap">
      <figcaption id="week-cap" class="chart-cap">XP de los últimos 7 días <span class="muted">· meta ${goal} XP</span></figcaption>
      <div class="week-plot">
        <div class="week-goal" style="bottom:${pct(goal)}%"><span>meta</span></div>
        ${days.map((d, i) => {
          const [y, m, dd] = d.split("-").map(Number);
          const label = DAYS[new Date(y, m - 1, dd).getDay()];
          return `
            <div class="week-col${d === today ? " today" : ""}" tabindex="0" aria-label="${label}: ${vals[i]} XP" data-tip="${vals[i]} XP">
              <span class="week-bar" data-tip="${vals[i]} XP" style="height:${vals[i] ? Math.max(pct(vals[i]), 2) : 0}%"></span>
              <span class="week-day">${d === today ? "hoy" : label}</span>
            </div>`;
        }).join("")}
      </div>
    </figure>`;
}

// ================= Perfil =================
export function meScreen(main, _params, app) {
  const s = app.save;
  const lp = levelProgress(s.xp);
  const st = streakNow(s);
  const got = ACHIEVEMENTS.filter((a) => s.ach[a.id]).length;

  main.innerHTML = `
    <div class="page me">
      <section class="me-head card">
        <span class="av huge">${avatar(s.avatar)}</span>
        <div class="me-id">
          <h1>${esc(s.name)}</h1>
          <p class="rank">${esc(rankFor(lp.level))}</p>
          <div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="${lp.need}" aria-valuenow="${lp.into}" aria-label="Progreso al nivel ${lp.level + 1}">
            <span style="width:${(lp.pct * 100).toFixed(1)}%"></span>
          </div>
          <p class="xp-cap"><b>Nivel ${lp.level}</b> · ${fmt(lp.into)} / ${fmt(lp.need)} XP para el nivel ${lp.level + 1}</p>
        </div>
      </section>

      <section class="stats">
        <div class="stat"><span class="k">Puntos</span><b>${fmt(totalPoints(s))}</b></div>
        <div class="stat"><span class="k">Estrellas</span><b>${totalStars(s)}<small>/${MAX_STARS}</small></b></div>
        <div class="stat"><span class="k">Niveles</span><b>${completedCount(s)}<small>/${LEVELS.length}</small></b></div>
        <div class="stat"><span class="k">Racha</span><b>${st.count}<small> ${st.count === 1 ? "día" : "días"}</small></b></div>
        <div class="stat"><span class="k">Mejor racha</span><b>${s.streak.best}</b></div>
        <div class="stat"><span class="k">Precisión</span><b>${accuracy(s)}<small>%</small></b></div>
        <div class="stat"><span class="k">Laboratorios</span><b>${s.stats.labs}</b></div>
        <div class="stat"><span class="k">Tiempo jugado</span><b class="sm">${hoursText(s.stats.seconds)}</b></div>
      </section>

      <section class="card">${weekChart(s)}</section>

      <section class="card">
        <h2 class="card-title">${em("map")} Mundos</h2>
        <ul class="worlds-list">
          ${WORLDS.map((w) => {
            const n = worldStars(s, w), tot = w.levels.length * 3, open = isWorldUnlocked(s, w);
            return `<li style="--h:${w.hue}" class="${open ? "" : "locked"}">
              <span class="wl-n">${w.id}</span>
              <span class="wl-name">${esc(w.name)}</span>
              <span class="wl-bar"><span style="width:${(n / tot) * 100}%"></span></span>
              <span class="wl-s">${open ? `${n}/${tot}` : icon("lock")}</span>
            </li>`;
          }).join("")}
        </ul>
      </section>

      <section class="card">
        <h2 class="card-title">${em("trophy")} Logros <span class="muted">${got}/${ACHIEVEMENTS.length}</span></h2>
        <div class="ach-grid">
          ${ACHIEVEMENTS.map((a) => {
            const t = s.ach[a.id];
            return `<div class="ach ${t ? "on" : ""}" title="${esc(a.desc)}">
              <span class="ach-i">${em(ACH_EM[a.id] || "star")}</span>
              <b>${esc(a.name)}</b>
              <small>${esc(a.desc)}</small>
              ${t ? `<small class="ach-d">${new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</small>` : a.gems ? `<small class="ach-g">${em("gem")} ${a.gems}</small>` : ""}
            </div>`;
          }).join("")}
        </div>
      </section>

      <nav class="me-links">
        <button class="row-link" data-act="go" data-to="shop">${icon("bag")}<span>Tienda</span>${icon("next")}</button>
        <button class="row-link" data-act="go" data-to="settings">${icon("gear")}<span>Ajustes</span>${icon("next")}</button>
        <button class="row-link" data-act="go" data-to="backup">${icon("download")}<span>Copia de seguridad</span>${icon("next")}</button>
        <button class="row-link" data-act="go" data-to="profiles">${icon("swap")}<span>Cambiar de jugador</span>${icon("next")}</button>
      </nav>
    </div>`;
}

function subHead(title, app, extra = "") {
  return `
    <header class="page-head">
      <button class="icon-btn" data-x="back" aria-label="Volver">${icon("back")}</button>
      <h1>${title}</h1>
      ${extra || "<span></span>"}
    </header>`;
}

// ================= Tienda =================
export function shopScreen(root, _params, app) {
  const s = app.save;
  function render() {
    root.innerHTML = `
      <div class="page narrow shop">
        ${subHead("Tienda", app, `<span class="pill gems static">${em("gem")}<b>${fmt(s.gems)}</b></span>`)}
        <p class="lead">Gana gemas con estrellas nuevas, jefes, logros, el Reto diario y el Contrarreloj.</p>

        <article class="shop-item card">
          <div class="si-icon freeze">${em("snowflake")}</div>
          <div class="si-main">
            <h2>Protector de racha</h2>
            <p>Si un día no juegas, se usa solo y tu racha sigue viva. Tienes <b>${s.streak.freezes}/${FREEZE_MAX}</b>.</p>
          </div>
          <button class="btn primary small" data-buy="freeze" ${s.streak.freezes >= FREEZE_MAX || s.gems < FREEZE_COST ? "disabled" : ""}>${em("gem")} ${FREEZE_COST}</button>
        </article>

        <h2 class="section-title">${em("palette")} Temas para el código</h2>
        <div class="theme-grid">
          ${CODE_THEMES.map((t) => {
            const owned = s.owned.themes.includes(t.id);
            const using = s.settings.codeTheme === t.id;
            return `<article class="theme-card card ${using ? "on" : ""}">
              <div class="theme-prev" data-code="${t.id}">${codeBlock('for i in range(3):\n    print(f"#{i}", True)', { lines: false })}</div>
              <div class="tc-foot">
                <b>${t.name}</b>
                ${using ? `<span class="tag">En uso</span>`
                  : owned ? `<button class="btn ghost small" data-use="${t.id}">Usar</button>`
                  : `<button class="btn primary small" data-theme="${t.id}" ${s.gems < t.price ? "disabled" : ""}>${em("gem")} ${t.price}</button>`}
              </div>
            </article>`;
          }).join("")}
        </div>
      </div>`;
  }
  render();
  root.addEventListener("click", (e) => {
    if (e.target.closest('[data-x="back"]')) return app.back("me");
    const b = e.target.closest("[data-buy], [data-theme], [data-use]");
    if (!b) return;
    if (b.dataset.buy && buyFreeze(s)) {
      sfx.coin();
      toast("Protector de racha comprado", { icon: "shield", kind: "good" });
    } else if (b.dataset.theme && buyTheme(s, b.dataset.theme)) {
      sfx.coin();
      toast("Tema desbloqueado y aplicado", { icon: "check", kind: "good" });
    } else if (b.dataset.use) {
      sfx.tap();
      s.settings.codeTheme = b.dataset.use;
    }
    app.applySettings();
    app.persist(true);
    render();
  });
}

// ================= Ajustes =================
export function settingsScreen(root, _params, app) {
  const s = app.save;
  const set = s.settings;
  let offPy = null;

  function seg(name, options, value) {
    return `<div class="seg" role="radiogroup">${options
      .map(([v, label]) => `<button role="radio" aria-checked="${String(v) === String(value)}" class="${String(v) === String(value) ? "on" : ""}" data-set="${name}" data-v="${v}">${label}</button>`)
      .join("")}</div>`;
  }

  function render() {
    offPy?.();
    const owned = CODE_THEMES.filter((t) => s.owned.themes.includes(t.id));
    root.innerHTML = `
      <div class="page narrow settings">
        ${subHead("Ajustes", app)}
        <section class="card form">
          <h2 class="card-title">Jugador</h2>
          <label class="field"><span>Nombre</span><input id="set-name" maxlength="16" value="${esc(s.name)}"></label>
          <div class="field"><span>Avatar</span>
            <div class="avatars">${store.AVATARS.map((a) => `<button type="button" class="av-pick ${a === s.avatar ? "on" : ""}" data-av="${a}" aria-label="Avatar ${a}">${avatar(a)}</button>`).join("")}</div>
          </div>
          <div class="field"><span>Meta diaria</span>${seg("goal", DAILY_GOALS.map((g) => [g.xp, `${g.name} · ${g.xp}`]), set.goal)}</div>
        </section>

        <section class="card form">
          <h2 class="card-title">Pantalla y sonido</h2>
          <div class="field"><span>Tema</span>${seg("theme", [["auto", "Automático"], ["light", "Claro"], ["dark", "Oscuro"]], set.theme)}</div>
          <div class="field"><span>Tamaño del código</span>${seg("codeSize", [[13, "Chico"], [15, "Normal"], [17, "Grande"], [19, "Enorme"]], set.codeSize)}</div>
          <div class="field"><span>Tema del código</span>${seg("codeTheme", owned.map((t) => [t.id, t.name]), set.codeTheme)}</div>
          <label class="toggle"><span>Sonidos</span><input type="checkbox" id="set-sound" data-tg="sound" ${set.sound ? "checked" : ""}><i></i></label>
          <label class="toggle"><span>Vibración</span><input type="checkbox" id="set-vibe" data-tg="vibe" ${set.vibe ? "checked" : ""}><i></i></label>
        </section>

        <section class="card">
          <h2 class="card-title">Python sin conexión</h2>
          <p class="muted">Los laboratorios y la consola usan Python real (unos 13 MB). Se descarga una vez y queda guardado para jugar sin internet.</p>
          <div class="lab-bar"><button class="btn ghost small" data-x="py">${icon("download")} Preparar Python</button><span class="py-status"></span></div>
        </section>

        <section class="card danger-zone">
          <h2 class="card-title">Zona de peligro</h2>
          <p class="muted">Borra este jugador y todo su progreso de este dispositivo. Haz antes una copia de seguridad si quieres conservarlo.</p>
          <button class="btn danger small" data-x="delete">${icon("trash")} Borrar a ${esc(s.name)}</button>
        </section>

        <p class="muted small center">Python GO v${VERSION} · Python ${"3.14"} con Pyodide</p>
      </div>`;
    const statusEl = root.querySelector(".py-status");
    const paint = (st) => {
      statusEl.innerHTML =
        st === "loading" ? `<span class="spin"></span> Descargando…`
        : st === "ready" ? `${icon("check")} Listo para usar sin conexión`
        : st === "error" ? "No se pudo descargar. Revisa tu conexión."
        : "";
    };
    offPy = onPythonStatus(paint);
    paint(pythonStatus());
  }
  render();

  root.addEventListener("click", async (e) => {
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (x === "back") return app.back("me");
    if (x === "py") return ensurePython().catch(() => {});
    if (x === "delete") {
      const ok = await confirmBox({ title: `¿Borrar a ${s.name}?`, body: "Se perderán su progreso, estrellas y logros en este dispositivo. No se puede deshacer.", yes: "Borrar", danger: true });
      if (!ok) return;
      store.deleteProfile(s.id);
      const next = store.getIndex().active;
      app.save = null;
      if (next) app.useProfile(store.loadProfile(next));
      app.replace(next ? "map" : "onboard");
      return;
    }
    const av = e.target.closest("[data-av]");
    if (av) {
      s.avatar = av.dataset.av;
      sfx.pick();
    }
    const b = e.target.closest("[data-set]");
    if (b) {
      const k = b.dataset.set;
      set[k] = typeof set[k] === "number" ? +b.dataset.v : b.dataset.v;
      sfx.tap();
    }
    if (av || b) {
      app.applySettings();
      app.persist();
      render();
    }
  });
  root.addEventListener("change", (e) => {
    const k = e.target.dataset?.tg;
    if (!k) return;
    set[k] = e.target.checked;
    app.applySettings();
    if (k === "sound" && set.sound) sfx.good();
    app.persist();
  });
  root.addEventListener("input", (e) => {
    if (e.target.id !== "set-name") return;
    const v = e.target.value.trim();
    if (v) {
      s.name = v;
      app.persist();
    }
  });
  return () => offPy?.();
}

// ================= Copia de seguridad =================
export function backupScreen(root, _params, app) {
  const s = app.save;
  const code = s ? store.exportSave(s) : "";
  root.innerHTML = `
    <div class="page narrow backup">
      ${subHead("Copia de seguridad", app)}
      ${s ? `
      <section class="card">
        <h2 class="card-title">${icon("upload")} Llevar mi progreso</h2>
        <p class="muted">Copia este código y pégalo en otro dispositivo (Perfil → Copia de seguridad → Importar). También puedes guardarlo como archivo.</p>
        <textarea id="bk-out" class="bk-code" readonly rows="4">${esc(code)}</textarea>
        <div class="row">
          <button class="btn primary small" data-x="copy">${icon("copy")} Copiar código</button>
          <button class="btn ghost small" data-x="file">${icon("download")} Guardar archivo</button>
        </div>
      </section>` : ""}
      <section class="card">
        <h2 class="card-title">${icon("download")} Importar un progreso</h2>
        <p class="muted">Pega el código o abre el archivo. Si ese jugador ya existe aquí, se reemplaza por la copia.</p>
        <textarea id="bk-in" class="bk-code" rows="4" placeholder="PYGO1:…"></textarea>
        <div class="row">
          <button class="btn primary small" data-x="import">Importar</button>
          <label class="btn ghost small file-btn">${icon("upload")} Abrir archivo<input type="file" id="bk-file" accept=".txt,.json,text/plain,application/json" hidden></label>
        </div>
      </section>
    </div>`;

  function doImport(text) {
    try {
      const save = store.importSave(text);
      app.useProfile(store.loadProfile(save.id));
      sfx.good();
      toast(`Progreso de ${esc(save.name)} importado`, { icon: "check", kind: "good" });
      app.replace("map");
    } catch (err) {
      sfx.bad();
      toast(esc(err.message), { icon: "x", kind: "bad" });
    }
  }

  root.addEventListener("click", async (e) => {
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (x === "back") return app.back(s ? "me" : "onboard");
    if (x === "copy") {
      const ok = await copyText(code);
      if (ok) toast("Código copiado", { icon: "copy", kind: "good" });
      else {
        const ta = root.querySelector("#bk-out");
        ta.focus();
        ta.select();
        toast("Selecciona el texto y cópialo manualmente.", { icon: "copy" });
      }
    }
    if (x === "file") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
      a.download = `python-go-${s.name.replace(/[^\w-]+/g, "_")}-${store.dayKey()}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    if (x === "import") doImport(root.querySelector("#bk-in").value);
  });
  root.querySelector("#bk-file").addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (f) doImport(await f.text());
  });
}
