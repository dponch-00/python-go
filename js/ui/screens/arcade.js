// Contrarreloj y Reto diario: preguntas rápidas de «¿Qué imprime?».
import { makeRng, genQuestion, tierFor, dailyQuestions, DAILY_COUNT } from "../../engine/arcade.js";
import { arcadePoints, ARCADE_TIME, ARCADE_BONUS_TIME, HEARTS } from "../../engine/scoring.js";
import { applyArcade, applyDaily, canDoDaily, recordAnswer } from "../../engine/game.js";
import { dayKey } from "../../engine/store.js";
import { esc, fmt, countUp, reducedMotion } from "../dom.js";
import { icon } from "../icons.js";
import { codeBlock } from "../highlight.js";
import { sfx } from "../sfx.js";
import { confetti } from "../confetti.js";

const optText = (o) => (o === "(error)" ? `<em class="err-opt">Da un error</em>` : esc(o));

function optionsHtml(q) {
  return q.options
    .map((o, i) => `<button class="opt mono" data-o="${i}"><span class="opt-k">${"ABCD"[i]}</span><span class="opt-v">${optText(o)}</span></button>`)
    .join("");
}

function floatText(host, text, kind) {
  if (reducedMotion()) return;
  const f = document.createElement("span");
  f.className = `float ${kind}`;
  f.textContent = text;
  host.append(f);
  setTimeout(() => f.remove(), 900);
}

// ================= Contrarreloj =================
export function arcadeScreen(root, _params, app) {
  const s = app.save;
  let raf = 0, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function intro() {
    root.innerHTML = `
      <div class="quiz intro">
        <button class="icon-btn corner" data-x="close" aria-label="Salir">${icon("close")}</button>
        <div class="intro-card card">
          <div class="intro-icon">${icon("clock")}</div>
          <h1>Contrarreloj</h1>
          <ul class="rules">
            <li>${icon("clock")} ${ARCADE_TIME} segundos; cada acierto suma ${ARCADE_BONUS_TIME} s</li>
            <li>${icon("heart")} ${HEARTS} vidas</li>
            <li>${icon("bolt")} Racha de 3 aciertos = puntos ×1.5, ×2, ×2.5…</li>
          </ul>
          <p class="muted">Récord actual: <b>${fmt(s.arcade.best)}</b> pts</p>
          <button class="btn primary big" data-x="start">${icon("play")} Empezar</button>
        </div>
      </div>`;
  }

  function play() {
    const rng = makeRng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    let timeLeft = ARCADE_TIME, hearts = HEARTS, score = 0, streak = 0, correct = 0, n = 0;
    let q = null, locked = false, paused = false, last = performance.now(), lastTick = 99;

    root.innerHTML = `
      <div class="quiz arcade-run">
        <header class="quiz-top">
          <button class="icon-btn" data-x="close" aria-label="Salir">${icon("close")}</button>
          <div class="tbar" role="timer" aria-label="Tiempo restante"><span class="tbar-fill"></span><b class="tbar-n"></b></div>
          <span class="hearts"></span>
        </header>
        <div class="quiz-score"><span class="sc-n">0</span><span class="sc-streak"></span></div>
        <div class="quiz-q"></div>
        <div class="opts grid"></div>
      </div>`;
    const $ = (sel) => root.querySelector(sel);
    const fill = $(".tbar-fill"), tn = $(".tbar-n"), heartsEl = $(".hearts"), scEl = $(".sc-n"), stEl = $(".sc-streak");
    const qEl = $(".quiz-q"), optsEl = $(".opts");

    const paintHearts = () => (heartsEl.innerHTML = Array.from({ length: HEARTS }, (_, i) => icon("heart", i < hearts ? "on" : "")).join(""));
    const paintStreak = () => {
      const { mult } = arcadePoints(1, streak);
      stEl.innerHTML = streak >= 3 ? `${icon("bolt")} ×${mult.toFixed(1)}` : "";
    };
    paintHearts();

    function next() {
      q = genQuestion(rng, tierFor(rng, n));
      n++;
      locked = false;
      qEl.innerHTML = `<p class="q-n">Pregunta ${n} · ¿Qué imprime?</p>${codeBlock(q.code, { lines: false })}`;
      optsEl.innerHTML = optionsHtml(q);
    }

    function loop(t) {
      const dt = (t - last) / 1000;
      last = t;
      if (!paused && !document.hidden) timeLeft -= dt;
      const shown = Math.max(0, Math.ceil(timeLeft));
      fill.style.transform = `scaleX(${Math.max(0, Math.min(1, timeLeft / ARCADE_TIME))})`;
      fill.classList.toggle("low", timeLeft < 10);
      tn.textContent = shown;
      if (shown <= 5 && shown < lastTick && shown > 0) sfx.tick();
      lastTick = shown;
      if (timeLeft <= 0) return end();
      raf = requestAnimationFrame(loop);
    }

    optsEl.addEventListener("click", (e) => {
      const b = e.target.closest(".opt");
      if (!b || locked) return;
      locked = true;
      const pick = q.options[+b.dataset.o];
      const ok = pick === q.answer;
      recordAnswer(s, ok);
      if (ok) {
        streak++;
        correct++;
        const { pts } = arcadePoints(q.tier, streak - 1);
        score += pts;
        timeLeft += ARCADE_BONUS_TIME;
        b.classList.add("right");
        sfx.good();
        floatText(root.querySelector(".quiz-score"), `+${pts}`, "good");
        scEl.textContent = fmt(score);
        paintStreak();
        later(next, 380);
      } else {
        streak = 0;
        hearts--;
        paused = true;
        b.classList.add("wrong");
        optsEl.querySelectorAll(".opt").forEach((x) => {
          if (q.options[+x.dataset.o] === q.answer) x.classList.add("right");
        });
        sfx.bad();
        paintHearts();
        paintStreak();
        later(() => {
          paused = false;
          if (hearts <= 0) end();
          else next();
        }, 1300);
      }
    });

    function end() {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers = [];
      const sum = applyArcade(s, { score, correct });
      app.persist(true);
      sum.newRecord && score > 0 ? (sfx.win(), setTimeout(() => confetti(120), 300)) : sfx.lose();
      root.innerHTML = `
        <div class="quiz end">
          <div class="end-card card">
            <p class="eyebrow">Contrarreloj</p>
            <h1>${sum.newRecord && score > 0 ? "¡Nuevo récord!" : hearts <= 0 ? "Sin vidas" : "¡Tiempo!"}</h1>
            <div class="res-total"><b class="num">0</b><span>puntos</span></div>
            <dl class="breakdown">
              <div><dt>Aciertos</dt><dd>${correct}</dd></div>
              <div><dt>Preguntas</dt><dd>${n}</dd></div>
              <div class="best-row"><dt>Tu récord</dt><dd>${fmt(s.arcade.best)}</dd></div>
            </dl>
            <div class="rewards">
              <span class="reward xp">+${sum.xp} XP</span>
              ${sum.gems ? `<span class="reward gem">${icon("gem")} +${sum.gems}</span>` : ""}
            </div>
          </div>
          <div class="res-actions">
            <button class="btn ghost" data-x="close">Salir</button>
            <button class="btn primary" data-x="start">${icon("refresh")} Otra vez</button>
          </div>
        </div>`;
      countUp(root.querySelector(".num"), score);
      setTimeout(() => app.celebrate(sum), 900);
    }

    next();
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  root.addEventListener("click", (e) => {
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (x === "close") app.back("games");
    if (x === "start") {
      sfx.tap();
      play();
    }
  });
  intro();
  return () => {
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
  };
}

// ================= Reto diario =================
export function dailyScreen(root, _params, app) {
  const s = app.save;
  const rewarded = canDoDaily(s);
  const qs = dailyQuestions(dayKey());
  const answers = [];
  let i = 0, t0 = 0, timers = [];

  function intro() {
    root.innerHTML = `
      <div class="quiz intro">
        <button class="icon-btn corner" data-x="close" aria-label="Salir">${icon("close")}</button>
        <div class="intro-card card">
          <div class="intro-icon">${icon("calendar")}</div>
          <p class="eyebrow">${new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>Reto diario</h1>
          <ul class="rules">
            <li>${icon("flag")} ${DAILY_COUNT} preguntas, de fácil a difícil</li>
            <li>${icon("star")} 25 puntos por acierto + bono por rapidez</li>
            <li>${icon("gem")} ${rewarded ? "Recompensa disponible hoy" : "Ya lo completaste hoy: esto es práctica"}</li>
          </ul>
          <button class="btn primary big" data-x="start">${icon("play")} ${rewarded ? "Empezar" : "Practicar"}</button>
        </div>
      </div>`;
  }

  function show() {
    const q = qs[i];
    root.innerHTML = `
      <div class="quiz daily-run">
        <header class="quiz-top">
          <button class="icon-btn" data-x="close" aria-label="Salir">${icon("close")}</button>
          <div class="steps" aria-label="Pregunta ${i + 1} de ${DAILY_COUNT}">
            ${qs.map((_, k) => `<span class="${k < i ? (answers[k].ok ? "ok" : "no") : k === i ? "now" : ""}"></span>`).join("")}
          </div>
        </header>
        <div class="quiz-q"><p class="q-n">Pregunta ${i + 1} de ${DAILY_COUNT} · ¿Qué imprime?</p>${codeBlock(q.code, { lines: false })}</div>
        <div class="opts grid">${optionsHtml(q)}</div>
      </div>`;
  }

  function finish() {
    const secs = (performance.now() - t0) / 1000;
    const correct = answers.filter((a) => a.ok).length;
    const bonus = correct >= DAILY_COUNT / 2 ? Math.max(0, Math.round(90 - secs)) : 0;
    const score = correct * 25 + bonus;
    let sum = null;
    if (rewarded) {
      sum = applyDaily(s, { score, correct, total: DAILY_COUNT });
      app.persist(true);
    }
    correct === DAILY_COUNT ? (sfx.win(), setTimeout(() => confetti(100), 300)) : sfx.good();
    root.innerHTML = `
      <div class="quiz end">
        <div class="end-card card">
          <p class="eyebrow">Reto diario${rewarded ? "" : " · práctica"}</p>
          <h1>${correct === DAILY_COUNT ? "¡Perfecto!" : correct >= 6 ? "¡Muy bien!" : "¡Completado!"}</h1>
          <div class="res-total"><b class="num">0</b><span>puntos</span></div>
          <dl class="breakdown">
            <div><dt>Aciertos</dt><dd>${correct} / ${DAILY_COUNT}</dd></div>
            <div><dt>Tiempo</dt><dd>${Math.round(secs)} s</dd></div>
            ${bonus ? `<div><dt>Bono de rapidez</dt><dd>+${bonus}</dd></div>` : ""}
          </dl>
          ${sum ? `<div class="rewards"><span class="reward xp">+${sum.xp} XP</span><span class="reward gem">${icon("gem")} +${sum.gems}</span></div>` : ""}
          <details class="review-answers">
            <summary>Ver respuestas</summary>
            ${answers.map((a, k) => `
              <div class="ra ${a.ok ? "ok" : "no"}">
                ${codeBlock(qs[k].code, { lines: false })}
                <p>${icon(a.ok ? "check" : "x")} ${a.ok ? "Acertaste" : `Elegiste <code class="ic">${esc(a.pick)}</code>`} · Respuesta: <code class="ic">${esc(qs[k].answer)}</code></p>
              </div>`).join("")}
          </details>
        </div>
        <div class="res-actions">
          <button class="btn primary" data-x="close">Listo</button>
        </div>
      </div>`;
    countUp(root.querySelector(".num"), score);
    if (sum) setTimeout(() => app.celebrate(sum), 900);
  }

  root.addEventListener("click", (e) => {
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (x === "close") return app.back("games");
    if (x === "start") {
      sfx.tap();
      t0 = performance.now();
      return show();
    }
    const b = e.target.closest(".opt");
    if (!b || root.querySelector(".opts.locked")) return;
    const q = qs[i];
    const pick = q.options[+b.dataset.o];
    const ok = pick === q.answer;
    answers.push({ ok, pick });
    if (rewarded) recordAnswer(s, ok);
    root.querySelector(".opts").classList.add("locked");
    b.classList.add(ok ? "right" : "wrong");
    if (!ok) root.querySelectorAll(".opt").forEach((x2) => q.options[+x2.dataset.o] === q.answer && x2.classList.add("right"));
    ok ? sfx.good() : sfx.bad();
    timers.push(setTimeout(() => (++i < DAILY_COUNT ? show() : finish()), ok ? 500 : 1300));
  });

  intro();
  return () => timers.forEach(clearTimeout);
}
