// Pantalla de nivel (los 6 tipos de acertijo) y pantalla de resultado.
import { LEVEL_BY_ID, TYPE_LABEL, WORLDS, TRACKS } from "../../data/worlds.js";
import { scoreRun, HEARTS, HINT_COST, REVEAL_AFTER } from "../../engine/scoring.js";
import { applyLevel, applyFail, recordAnswer, spendHint, isLevelUnlocked, nextLevel, worldOf } from "../../engine/game.js";
import { ensurePython, runPython, onPythonStatus, pythonStatus, explainError } from "../../engine/python.js";
import { esc, md, fmt, shuffle, toast, countUp } from "../dom.js";
import { icon } from "../icons.js";
import { em } from "../emoji.js";
import { highlight, codeBlock } from "../highlight.js";
import { createCodeEditor } from "../code-editor.js";
import { sfx } from "../sfx.js";
import { confetti } from "../confetti.js";

const GOOD = ["¡Correcto!", "¡Exacto!", "¡Bien hecho!", "¡Así se hace!", "¡Perfecto!"];
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
const LETTERS = "ABCD";

// Texto de una opción de salida: "(error)" se muestra como etiqueta.
const optText = (o) => (o === "(error)" ? `<em class="err-opt">Da un error</em>` : esc(o));

// ---------- Borradores de laboratorio ----------
const draftKey = (s, lv) => `pygo:draft:${s.id}:${lv.id}`;
function loadDraft(s, lv) {
  try {
    return localStorage.getItem(draftKey(s, lv));
  } catch {
    return null;
  }
}
function saveDraft(s, lv, v) {
  try {
    localStorage.setItem(draftKey(s, lv), v);
  } catch {}
}

// ================= Controladores de acertijos =================
// Cada uno devuelve { ready(), check() → {ok}, reset(), reveal(), hintExtra?() }.

function choicePuzzle(box, lv, changed) {
  const opts = shuffle(lv.opts.map((o, i) => ({ o, i })));
  const mono = !lv.noRun;
  box.innerHTML = `
    ${lv.code ? codeBlock(lv.code) : ""}
    <div class="opts" role="radiogroup" aria-label="Opciones">
      ${opts.map(({ o, i }, k) => `
        <button class="opt${mono ? " mono" : ""}" role="radio" aria-checked="false" data-i="${i}">
          <span class="opt-k">${LETTERS[k]}</span><span class="opt-v">${optText(o)}</span>
        </button>`).join("")}
    </div>`;
  let sel = null;
  const btns = [...box.querySelectorAll(".opt")];
  box.querySelector(".opts").addEventListener("click", (e) => {
    const b = e.target.closest(".opt");
    if (!b || b.disabled) return;
    sfx.pick();
    sel = +b.dataset.i;
    btns.forEach((x) => {
      x.classList.toggle("sel", x === b);
      x.setAttribute("aria-checked", x === b);
      x.classList.remove("wrong");
    });
    changed();
  });
  return {
    ready: () => sel !== null,
    check() {
      const ok = sel === lv.a;
      btns.find((b) => +b.dataset.i === sel)?.classList.add(ok ? "right" : "wrong");
      return { ok };
    },
    reset() {
      btns.forEach((b) => b.classList.remove("sel", "wrong"));
      sel = null;
    },
    reveal() {
      btns.forEach((b) => (b.disabled = true));
      btns.find((b) => +b.dataset.i === lv.a)?.classList.add("right");
    },
    hintExtra() {
      const wrong = btns.filter((b) => +b.dataset.i !== lv.a && !b.disabled && +b.dataset.i !== sel);
      const b = wrong[Math.floor(Math.random() * wrong.length)];
      if (b) {
        b.disabled = true;
        b.classList.add("gone");
      }
    },
  };
}

const normIn = (s) =>
  String(s).trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").replace(/"/g, "'");

function inputPuzzle(box, lv, changed, submit) {
  box.innerHTML = `
    ${codeBlock(lv.code)}
    <label class="answer">
      <span class="answer-l">${icon("terminal")} Salida</span>
      <input id="answer-${lv.id}" class="answer-in" type="text" inputmode="text" autocomplete="off" autocapitalize="off"
        autocorrect="off" spellcheck="false" placeholder="Escribe aquí lo que se imprime">
    </label>`;
  const inp = box.querySelector("input");
  inp.addEventListener("input", changed);
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && inp.value.trim()) submit();
  });
  setTimeout(() => inp.focus({ preventScroll: true }), 250);
  return {
    ready: () => inp.value.trim().length > 0,
    check() {
      const ok = [lv.a, ...(lv.alt || [])].some((a) => normIn(a) === normIn(inp.value));
      inp.classList.toggle("wrong", !ok);
      inp.classList.toggle("right", ok);
      return { ok };
    },
    reset() {
      inp.classList.remove("wrong");
      inp.select();
    },
    reveal() {
      inp.value = lv.a;
      inp.disabled = true;
      inp.classList.remove("wrong");
      inp.classList.add("right");
    },
  };
}

function fillPuzzle(box, lv, changed) {
  let k = 0;
  const marked = lv.code.replace(/___/g, () => `__SLOT${k++}__`);
  const rows = highlight(marked).split("\n");
  const bank = shuffle(lv.bank.map((t, i) => ({ t, i })));
  box.innerHTML = `
    <pre class="code fill"><code>${rows.map((r, i) => `<span class="ln" data-n="${i + 1}">${r.replace(/__SLOT(\d+)__/g, '<button class="slot" data-s="$1" aria-label="Hueco $1">&nbsp;</button>') || " "}</span>`).join("")}</code></pre>
    ${lv.goal ? `<p class="goal">${icon("target")} Debe imprimir: <code class="ic">${esc(lv.goal)}</code></p>` : ""}
    <div class="bank" aria-label="Piezas disponibles">
      ${bank.map(({ t, i }) => `<button class="chip-code" data-b="${i}">${highlight(t)}</button>`).join("")}
    </div>`;
  const slots = [...box.querySelectorAll(".slot")];
  slots.forEach((s, i) => s.setAttribute("aria-label", `Hueco ${i + 1}`));
  const chips = [...box.querySelectorAll(".chip-code")];
  const filled = slots.map(() => null); // índice del banco en cada hueco

  function paint() {
    slots.forEach((s, i) => {
      const b = filled[i];
      s.innerHTML = b == null ? "&nbsp;" : highlight(lv.bank[b]);
      s.classList.toggle("full", b != null);
    });
    chips.forEach((c) => (c.disabled = filled.includes(+c.dataset.b)));
    changed();
  }
  box.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip-code");
    const slot = e.target.closest(".slot");
    if (chip && !chip.disabled) {
      const free = filled.indexOf(null);
      if (free < 0) return;
      sfx.pick();
      filled[free] = +chip.dataset.b;
      slots.forEach((s) => s.classList.remove("wrong"));
      paint();
    } else if (slot && filled[+slot.dataset.s] != null) {
      sfx.tap();
      filled[+slot.dataset.s] = null;
      slot.classList.remove("wrong");
      paint();
    }
  });
  return {
    ready: () => filled.every((b) => b != null),
    check() {
      let ok = true;
      filled.forEach((b, i) => {
        const good = lv.blanks[i].includes(lv.bank[b]);
        slots[i].classList.toggle("wrong", !good);
        slots[i].classList.toggle("right", good);
        if (!good) ok = false;
      });
      return { ok };
    },
    reset() {},
    reveal() {
      lv.blanks.forEach((acc, i) => {
        filled[i] = lv.bank.indexOf(acc[0]);
      });
      paint();
      slots.forEach((s) => {
        s.classList.remove("wrong");
        s.classList.add("right");
        s.disabled = true;
      });
      chips.forEach((c) => (c.disabled = true));
    },
  };
}

function orderPuzzle(box, lv, changed) {
  const head = lv.head || [];
  let pool = shuffle(lv.lines.map((t, i) => ({ t, i })));
  // Evita que salga ya ordenado.
  if (pool.every((p, k) => p.i === k)) pool.push(pool.shift());
  const placed = [];
  function lineBtn(p, where) {
    return `<button class="oline" data-w="${where}" data-i="${p.i}"><code>${highlight(p.t)}</code></button>`;
  }
  function paint() {
    box.innerHTML = `
      <p class="order-cap">Tu programa</p>
      <div class="program ${placed.length ? "" : "empty"}">
        ${head.map((t) => `<div class="oline fixed"><code>${highlight(t)}</code></div>`).join("")}
        ${placed.map((p) => lineBtn(p, "prog")).join("")}
        ${placed.length ? "" : `<p class="ph">Toca las líneas de abajo en orden</p>`}
      </div>
      ${lv.goal ? `<p class="goal">${icon("target")} Debe imprimir: <code class="ic">${esc(lv.goal)}</code></p>` : ""}
      <p class="order-cap">Líneas disponibles</p>
      <div class="pool">${pool.map((p) => lineBtn(p, "pool")).join("") || `<p class="ph">¡Listo! Pulsa Comprobar.</p>`}</div>`;
    changed();
  }
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".oline[data-w]");
    if (!b || b.disabled) return;
    sfx.pick();
    const i = +b.dataset.i;
    if (b.dataset.w === "pool") {
      const k = pool.findIndex((p) => p.i === i);
      placed.push(pool.splice(k, 1)[0]);
    } else {
      const k = placed.findIndex((p) => p.i === i);
      pool.push(placed.splice(k, 1)[0]);
    }
    paint();
  });
  paint();
  return {
    ready: () => pool.length === 0,
    check() {
      const bad = placed.findIndex((p, k) => p.t !== lv.lines[k]);
      if (bad >= 0) box.querySelectorAll(".program .oline[data-w]")[bad]?.classList.add("wrong");
      return { ok: bad < 0 };
    },
    reset() {
      box.querySelectorAll(".oline.wrong").forEach((b) => b.classList.remove("wrong"));
    },
    reveal() {
      placed.length = 0;
      lv.lines.forEach((t, i) => placed.push({ t, i }));
      pool = [];
      paint();
      box.querySelectorAll(".oline").forEach((b) => {
        b.disabled = true;
        b.classList.add("right");
      });
    },
  };
}

function bugPuzzle(box, lv, changed) {
  const rows = highlight(lv.code).split("\n");
  const src = lv.code.split("\n");
  box.innerHTML = `
    <pre class="code bug"><code>${rows.map((r, i) => (src[i].trim()
      ? `<button class="ln bl" data-n="${i + 1}" aria-label="Línea ${i + 1}">${r}</button>`
      : `<span class="ln" data-n="${i + 1}"> </span>`)).join("")}</code></pre>
    ${lv.goal ? `<p class="goal">${icon("target")} Debería imprimir: <code class="ic">${esc(lv.goal)}</code></p>` : ""}`;
  let sel = null;
  const lines = [...box.querySelectorAll(".bl")];
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".bl");
    if (!b || b.disabled) return;
    sfx.pick();
    sel = +b.dataset.n;
    lines.forEach((x) => x.classList.toggle("sel", x === b));
    lines.forEach((x) => x.classList.remove("wrong"));
    changed();
  });
  return {
    ready: () => sel !== null,
    check() {
      const ok = sel === lv.line;
      lines.find((b) => +b.dataset.n === sel)?.classList.add(ok ? "right" : "wrong");
      return { ok };
    },
    reset() {
      lines.forEach((b) => b.classList.remove("sel", "wrong"));
      sel = null;
    },
    reveal() {
      lines.forEach((b) => (b.disabled = true));
      lines.find((b) => +b.dataset.n === lv.line)?.classList.add("right");
    },
    fixHtml() {
      const fixed = lv.fix.split("\n")[lv.line - 1];
      return `<p class="fb-fix">Corrección de la línea ${lv.line}:</p>${codeBlock(fixed.trim(), { lines: false })}`;
    },
  };
}

// ================= Pantalla de nivel =================
export function levelScreen(root, params, app) {
  const s = app.save;
  const lv = LEVEL_BY_ID.get(params.id);
  const mode = params.mode || "normal";
  if (!lv || (mode !== "review" && !isLevelUnlocked(s, lv))) {
    queueMicrotask(() => app.replace("map"));
    return;
  }
  const w = worldOf(lv);
  const isLab = lv.t === "code";
  const firstTime = !s.levels[lv.id];
  let hearts = HEARTS, mistakes = 0, hints = 0, revealed = false, finished = false;
  const cleanups = [];

  // Cronómetro que se pausa cuando la app queda en segundo plano.
  let acc = 0, since = performance.now();
  const onVis = () => {
    if (document.hidden) acc += performance.now() - since;
    else since = performance.now();
  };
  document.addEventListener("visibilitychange", onVis);
  const seconds = () => (acc + (document.hidden ? 0 : performance.now() - since)) / 1000;

  root.innerHTML = `
    <div class="play" style="--h:${w.hue}">
      <header class="play-top">
        <button class="icon-btn" data-x="close" aria-label="Salir del nivel">${icon("close")}</button>
        <div class="play-title">
          <span class="eyebrow">${mode === "review" ? "Repaso · " : ""}${esc(w.label)} · Nivel ${lv.num}${lv.boss ? " · Jefe" : ""}</span>
          <b>${esc(lv.title)}</b>
        </div>
        <div class="play-meta">
          ${isLab ? `<span class="tries" aria-live="polite"></span>` : `<span class="hearts" aria-live="polite"></span>`}
          <span class="timer" aria-hidden="true">${icon("clock")}<b>0</b></span>
        </div>
      </header>
      <div class="play-body">
        ${lv.learn ? `<details class="learn"${firstTime ? " open" : ""}><summary>${em("books")} Concepto</summary><div>${md(lv.learn)}</div></details>` : ""}
        <div class="q-head">
          <span class="type-chip">${esc(TYPE_LABEL[lv.t])}</span>
          <h1 class="q">${md(lv.q)}</h1>
        </div>
        <div class="puzzle"></div>
        <div class="hint-box" hidden></div>
      </div>
      <footer class="play-foot">
        <button class="btn ghost" data-x="hint">${em("bulb")} Pista <span class="cost">${em("gem")}${HINT_COST}</span></button>
        <button class="btn primary" data-x="check" disabled>Comprobar</button>
      </footer>
      <div class="feedback" hidden></div>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const box = $(".puzzle");
  const checkBtn = $('[data-x="check"]');
  const hintBtn = $('[data-x="hint"]');
  const fb = $(".feedback");

  const timerEl = $(".timer b");
  const tick = setInterval(() => (timerEl.textContent = Math.floor(seconds())), 1000);

  function paintHearts() {
    const h = $(".hearts");
    if (h) {
      h.innerHTML = Array.from({ length: HEARTS }, (_, i) => em("heart", i < hearts ? "on" : "off")).join("");
      h.setAttribute("aria-label", `Vidas: ${hearts}`);
    }
    const t = $(".tries");
    if (t) t.textContent = mistakes ? `${mistakes} ${mistakes === 1 ? "intento fallido" : "intentos fallidos"}` : "";
  }
  paintHearts();

  let ctl = null;
  // Los acertijos pueden avisar cambios mientras se construyen (antes de asignar ctl).
  const changed = () => {
    if (ctl) checkBtn.disabled = !ctl.ready();
  };

  if (lv.t === "choice") ctl = choicePuzzle(box, lv, changed);
  else if (lv.t === "input") ctl = inputPuzzle(box, lv, changed, () => onCheck());
  else if (lv.t === "fill") ctl = fillPuzzle(box, lv, changed);
  else if (lv.t === "order") ctl = orderPuzzle(box, lv, changed);
  else if (lv.t === "bug") ctl = bugPuzzle(box, lv, changed);
  else ctl = labPuzzle();

  // ---------- Laboratorio (código real) ----------
  function labPuzzle() {
    box.innerHTML = `
      <div class="lab">
        ${lv.pre ? `<div class="given"><span class="given-l">Ya definido (cambia en cada prueba)</span>${codeBlock(lv.pre, { lines: false })}</div>` : ""}
        <p class="goal">${icon("target")} ${md(lv.goal)}</p>
        <div class="ed-host"></div>
        <div class="lab-bar">
          <button class="btn ghost small" data-x="run">${icon("play")} Ejecutar</button>
          <button class="btn ghost small" data-x="reset" aria-label="Restaurar el código inicial">${icon("refresh")}</button>
          <span class="py-status" aria-live="polite"></span>
        </div>
        <div class="out" hidden></div>
        <ul class="tests" hidden></ul>
      </div>`;
    const draft = loadDraft(s, lv);
    const edHost = box.querySelector(".ed-host");
    const edReady = createCodeEditor(edHost, {
      value: draft ?? lv.starter + "\n",
      onChange: (v) => saveDraft(s, lv, v),
      onRun: () => run(),
      label: "Tu código",
    }).then((ed) => (edHost.editor = ed));
    const statusEl = box.querySelector(".py-status");
    const outEl = box.querySelector(".out");
    const testsEl = box.querySelector(".tests");
    const paintStatus = (st) => {
      statusEl.className = `py-status ${st}`;
      statusEl.innerHTML =
        st === "loading" ? `<span class="spin"></span> Preparando Python…`
        : st === "ready" ? `${icon("check")} Python listo`
        : st === "error" ? `No se pudo cargar Python. <button class="link" data-x="retry-py">Reintentar</button>`
        : "";
    };
    const off = onPythonStatus(paintStatus);
    paintStatus(pythonStatus());
    ensurePython().catch(() => {});
    cleanups.push(off);

    function showOut(res) {
      outEl.hidden = false;
      if (res.timeout) {
        outEl.innerHTML = `<p class="out-err"><b>Tiempo agotado.</b> Tu código tardó demasiado: ¿hay un bucle infinito?</p>`;
        return;
      }
      const out = res.out ? `<pre class="out-text">${esc(res.out.replace(/\n$/, ""))}</pre>` : `<p class="muted small">(sin salida)</p>`;
      const err = res.err
        ? `<div class="out-err"><b>${esc(res.err.type)}${res.err.line ? ` en la línea ${res.err.line}` : ""}:</b> ${esc(res.err.msg)}<p class="muted">${esc(explainError(res.err))}</p></div>`
        : "";
      outEl.innerHTML = `<p class="out-cap">Salida</p>${out}${err}`;
      edReady.then((ed) => ed.markLine(res.err?.line || 0));
    }

    async function run() {
      sfx.tap();
      const ed = await edReady;
      try {
        showOut(await runPython(ed.value, { pre: lv.pre || "" }));
      } catch {
        paintStatus("error");
      }
    }

    box.addEventListener("click", async (e) => {
      const x = e.target.closest("[data-x]")?.dataset.x;
      if (x === "run") run();
      if (x === "reset") {
        (await edReady).value = lv.starter + "\n";
        outEl.hidden = testsEl.hidden = true;
      }
      if (x === "retry-py") ensurePython().catch(() => {});
      if (x === "reveal") {
        revealed = true;
        (await edReady).value = lv.sol + "\n";
        toast("Esta es una solución posible. Estúdiala y pulsa Comprobar.", { icon: "eye" });
        e.target.closest("[data-x]").remove();
      }
    });

    return {
      ready: () => true,
      async check() {
        checkBtn.disabled = true;
        checkBtn.innerHTML = `<span class="spin"></span> Probando…`;
        let res;
        const ed = await edReady;
        try {
          res = await runPython(ed.value, { pre: lv.pre || "", tests: lv.tests });
        } catch {
          paintStatus("error");
          checkBtn.disabled = false;
          checkBtn.textContent = "Comprobar";
          return { ok: null };
        }
        checkBtn.disabled = false;
        checkBtn.textContent = "Comprobar";
        showOut(res);
        if (res.timeout) return { ok: false };
        testsEl.hidden = false;
        testsEl.innerHTML = res.tests
          .map((t) => `<li class="${t.ok ? "ok" : "no"}">${icon(t.ok ? "check" : "x")}<span>${md(t.msg)}${!t.ok && t.got ? `<small>Obtuviste: <code class="ic">${esc(String(t.got).slice(0, 160))}</code></small>` : ""}</span></li>`)
          .join("");
        return { ok: res.tests.length > 0 && res.tests.every((t) => t.ok) };
      },
      reset() {},
      reveal() {},
      afterFail() {
        if (mistakes >= REVEAL_AFTER && !revealed && !box.querySelector('[data-x="reveal"]')) {
          box.querySelector(".lab-bar").insertAdjacentHTML("beforeend", `<button class="btn ghost small" data-x="reveal">${icon("eye")} Ver solución</button>`);
        }
      },
    };
  }

  // ---------- Retroalimentación ----------
  function feedback(kind, title, body, actions) {
    fb.className = `feedback ${kind}`;
    fb.innerHTML = `
      <div class="fb-inner">
        <div class="fb-head">${icon(kind === "good" ? "check" : "x")}<h2>${title}</h2></div>
        <div class="fb-body">${body}</div>
        <div class="fb-actions">${actions.map((a, i) => `<button class="btn ${a.kind}" data-fb="${i}">${a.label}</button>`).join("")}</div>
      </div>`;
    fb.hidden = false;
    fb.onclick = (e) => {
      const b = e.target.closest("[data-fb]");
      if (b) actions[+b.dataset.fb].onClick();
    };
    requestAnimationFrame(() => fb.querySelector(".fb-actions .btn:last-child")?.focus());
  }
  const hideFeedback = () => (fb.hidden = true);

  function shake() {
    box.classList.remove("shake");
    void box.offsetWidth;
    box.classList.add("shake");
  }

  function succeed() {
    finished = true;
    clearInterval(tick);
    const secs = seconds();
    const run = { ...scoreRun(lv, { mistakes, hints, seconds: secs, combo: app.combo || 0, revealed }), seconds: secs, hints, mistakes };
    app.combo = run.combo;
    const sum = applyLevel(s, lv, run, { mode });
    app.persist(true);
    sfx.good();
    const next = () => {
      app.transient = { lv, run, sum, mode, queue: params.queue || [] };
      app.replace("result");
    };
    feedback("good", pickOne(GOOD), `<p>${md(lv.why)}</p>`, [{ label: "Continuar", kind: "primary", onClick: next }]);
  }

  function lose() {
    finished = true;
    clearInterval(tick);
    app.combo = 0;
    applyFail(s, lv);
    app.persist(true);
    sfx.lose();
    ctl.reveal();
    feedback(
      "bad",
      "Te quedaste sin vidas",
      `<p>${md(lv.why)}</p>${ctl.fixHtml ? ctl.fixHtml() : ""}<p class="muted small">Este nivel se añadió a tu lista de repaso.</p>`,
      [
        { label: "Mapa", kind: "ghost", onClick: () => app.replace("map") },
        { label: "Reintentar", kind: "primary", onClick: () => app.replace("level", params) },
      ]
    );
  }

  async function onCheck() {
    if (finished || !ctl.ready()) return;
    const res = await ctl.check();
    if (res.ok === null) return; // Python no disponible
    recordAnswer(s, res.ok);
    if (res.ok) return succeed();
    mistakes++;
    sfx.bad();
    shake();
    if (isLab) {
      paintHearts();
      ctl.afterFail();
      app.persist();
      return;
    }
    hearts--;
    paintHearts();
    app.persist();
    if (hearts <= 0) return lose();
    feedback(
      "bad",
      "No es correcto",
      `<p>Te ${hearts === 1 ? "queda 1 vida" : `quedan ${hearts} vidas`}. Revísalo con calma.${hints ? "" : " Si te atoras, usa una pista."}</p>`,
      [{ label: "Reintentar", kind: "primary", onClick: () => { hideFeedback(); ctl.reset(); changed(); } }]
    );
  }

  function onHint() {
    if (hints) return;
    if (!spendHint(s)) {
      toast(`Necesitas ${HINT_COST} gemas para una pista. Gánalas completando niveles.`, { icon: "gem" });
      return;
    }
    hints++;
    sfx.coin();
    app.persist();
    const hb = $(".hint-box");
    hb.hidden = false;
    hb.innerHTML = `${em("bulb")}<p>${md(lv.hint)}</p>`;
    ctl.hintExtra?.();
    hintBtn.disabled = true;
    hintBtn.innerHTML = `${em("bulb", "off")} Pista usada`;
  }

  root.addEventListener("click", (e) => {
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (x === "close") app.back();
    else if (x === "check") onCheck();
    else if (x === "hint") onHint();
  });
  const onKey = (e) => {
    if (e.key === "Enter" && !fb.hidden) fb.querySelector(".fb-actions .btn:last-child")?.click();
  };
  document.addEventListener("keydown", onKey);

  changed();
  return () => {
    clearInterval(tick);
    document.removeEventListener("visibilitychange", onVis);
    document.removeEventListener("keydown", onKey);
    cleanups.forEach((f) => f());
  };
}

// ================= Resultado =================
export function resultScreen(root, _params, app) {
  const t = app.transient;
  if (!t) {
    queueMicrotask(() => app.replace("map"));
    return;
  }
  const { lv, run, sum, mode, queue } = t;
  const w = worldOf(lv);
  const next = mode === "review" ? null : nextLevel(lv);
  const trackName = TRACKS.find((x) => x.id === lv.track)?.name;
  const title = lv.boss ? (!nextLevel(lv) ? `¡Completaste ${trackName}!` : "¡Jefe derrotado!") : run.stars === 3 ? "¡Perfecto!" : "¡Nivel superado!";
  // Mundos que se abren con esta victoria: el siguiente de la ruta y los que pedían este nivel.
  const unlocks = sum.firstClear && lv.boss
    ? WORLDS.filter((x) => x.needs === lv.id || (next && x.id === next.world))
    : [];
  const rows = [
    ["Base", `+${run.base}`],
    run.precision ? ["Sin errores", `+${run.precision}`] : null,
    run.speed ? ["Velocidad", `+${run.speed}`] : null,
    run.mult > 1 ? [`Combo ×${run.mult.toFixed(1)}`, `${run.combo} perfectos seguidos`] : null,
  ].filter(Boolean);

  root.innerHTML = `
    <div class="result" style="--h:${w.hue}">
      <div class="res-card card">
        <p class="eyebrow">${mode === "review" ? "Repaso · " : ""}${esc(w.label)} · Nivel ${lv.num}</p>
        ${lv.boss ? em("trophy", "res-trophy") : ""}
        <h1 class="res-title">${title}</h1>
        <div class="res-stars" aria-label="${run.stars} de 3 estrellas">
          ${[0, 1, 2].map((i) => `<span class="big-star" data-i="${i}">${em("star")}</span>`).join("")}
        </div>
        <div class="res-total"><b class="num">0</b><span>puntos</span></div>
        <dl class="breakdown">
          ${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}
          <div class="best-row"><dt>Tu mejor marca</dt><dd>${fmt(sum.record.best)}</dd></div>
        </dl>
        <div class="rewards">
          <span class="reward xp">+${fmt(sum.xp)} XP</span>
          ${sum.gems ? `<span class="reward gem">${em("gem")} +${sum.gems}</span>` : ""}
          <span class="reward time">${icon("clock")} ${Math.round(run.seconds ?? 0) || Math.round(sum.record.time)} s</span>
        </div>
        ${unlocks.map((x) => `<p class="unlock">${em(x.art || `w${x.id}`)} Se abrió <b>${esc(x.label)}: ${esc(x.name)}</b></p>`).join("")}
      </div>
      <div class="res-actions">
        <button class="btn ghost" data-x="retry">${icon("refresh")} Repetir</button>
        ${mode === "review"
          ? `<button class="btn primary" data-x="next-review">${queue.length ? "Siguiente repaso" : "Terminar repaso"}</button>`
          : next
            ? `<button class="btn primary" data-x="next">Siguiente nivel ${icon("next")}</button>`
            : `<button class="btn primary" data-x="map">Ver el mapa</button>`}
      </div>
      <button class="link center-link" data-x="map">Volver al mapa</button>
    </div>`;

  const stars = [...root.querySelectorAll(".big-star")];
  stars.forEach((el, i) => {
    if (i < run.stars) {
      setTimeout(() => {
        el.classList.add("on");
        sfx.star(i);
      }, 350 + i * 330);
    }
  });
  countUp(root.querySelector(".res-total .num"), run.total, 1100);
  if (run.stars === 3 || lv.boss) setTimeout(() => confetti(lv.boss ? 160 : 90), 1300);
  if (lv.boss) setTimeout(() => sfx.win(), 1200);
  setTimeout(() => app.celebrate(sum), 1500);

  root.addEventListener("click", (e) => {
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (!x) return;
    sfx.tap();
    if (x === "retry") app.replace("level", { id: lv.id, mode, queue });
    if (x === "next") app.replace("level", { id: next.id });
    if (x === "map") app.replace("map");
    if (x === "next-review") {
      if (queue.length) app.replace("level", { id: queue[0], mode: "review", queue: queue.slice(1) });
      else app.replace("games");
    }
  });
}
