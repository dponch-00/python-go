// Lógica de progreso: desbloqueos, estrellas, rachas, repasos, logros y recompensas.
import { WORLDS, LEVELS, LEVEL_BY_ID, MAX_STARS } from "../data/worlds.js";
import { levelFromXp, HINT_COST } from "./scoring.js";
import { dayKey, dayDiff, addDays } from "./store.js";

// ---------- Consultas ----------
export const rec = (s, id) => s.levels[id];
export const isDone = (s, id) => !!s.levels[id]?.done;

export function worldOf(lv) {
  return WORLDS.find((w) => w.id === lv.world);
}

export function isWorldUnlocked(s, w) {
  const i = WORLDS.indexOf(w);
  if (i <= 0) return true;
  const prev = WORLDS[i - 1];
  return isDone(s, prev.levels[prev.levels.length - 1].id);
}

export function isLevelUnlocked(s, lv) {
  const w = worldOf(lv);
  if (!isWorldUnlocked(s, w)) return false;
  return lv.index === 0 || isDone(s, w.levels[lv.index - 1].id);
}

export function currentLevel(s) {
  return LEVELS.find((lv) => !isDone(s, lv.id) && isLevelUnlocked(s, lv)) || null;
}

export function nextLevel(lv) {
  const i = LEVELS.indexOf(lv);
  return LEVELS[i + 1] || null;
}

export const worldStars = (s, w) => w.levels.reduce((n, lv) => n + (s.levels[lv.id]?.stars || 0), 0);
export const worldDone = (s, w) => w.levels.every((lv) => isDone(s, lv.id));
export const totalStars = (s) => Object.values(s.levels).reduce((n, r) => n + (r.stars || 0), 0);
export const totalPoints = (s) => Object.values(s.levels).reduce((n, r) => n + (r.best || 0), 0);
export const completedCount = (s) => Object.values(s.levels).filter((r) => r.done).length;
export const worldsDone = (s) => WORLDS.filter((w) => worldDone(s, w)).length;
export const bossesDone = (s) => WORLDS.filter((w) => isDone(s, w.levels[w.levels.length - 1].id)).length;

export function accuracy(s) {
  return s.stats.answers ? Math.round((s.stats.correct / s.stats.answers) * 100) : 0;
}

// ---------- Racha ----------
export function streakNow(s) {
  const st = s.streak;
  if (!st.last) return { count: 0, today: false };
  const gap = dayDiff(st.last, dayKey());
  if (gap <= 0) return { count: st.count, today: true };
  if (gap === 1) return { count: st.count, today: false };
  if (gap - 1 <= st.freezes) return { count: st.count, today: false, frozen: true };
  return { count: 0, today: false, lost: true };
}

function touchStreak(s) {
  const t = dayKey();
  const st = s.streak;
  let usedFreeze = 0;
  if (st.last === t) return 0;
  if (!st.last) st.count = 1;
  else {
    const gap = dayDiff(st.last, t);
    if (gap === 1) st.count++;
    else if (gap > 1) {
      const missed = gap - 1;
      if (st.freezes >= missed) {
        st.freezes -= missed;
        usedFreeze = missed;
        st.count++;
      } else st.count = 1;
    }
  }
  st.last = t;
  st.best = Math.max(st.best, st.count);
  return usedFreeze;
}

export const todayXp = (s) => s.days[dayKey()] || 0;

// Suma XP al día de hoy, actualiza la racha y la meta diaria.
function gainXp(s, xp) {
  const t = dayKey();
  const before = s.days[t] || 0;
  s.days[t] = before + xp;
  s.xp += xp;
  const cutoff = addDays(t, -120);
  for (const k of Object.keys(s.days)) if (k < cutoff) delete s.days[k];
  const usedFreeze = xp > 0 ? touchStreak(s) : 0;
  const goalReached = before < s.settings.goal && s.days[t] >= s.settings.goal;
  if (goalReached) s.goalDays++;
  return { goalReached, usedFreeze };
}

// ---------- Repasos (repetición espaciada) ----------
const BOX_DAYS = [1, 3, 7];

export function dueReviews(s) {
  const t = dayKey();
  return Object.entries(s.review)
    .filter(([id, r]) => r.due <= t && LEVEL_BY_ID.has(id))
    .sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
    .map(([id]) => LEVEL_BY_ID.get(id));
}

function scheduleReview(s, id) {
  s.review[id] = { box: 0, due: addDays(dayKey(), 1) };
}

function promoteReview(s, id) {
  const r = s.review[id];
  if (!r) return;
  r.box++;
  if (r.box >= BOX_DAYS.length) delete s.review[id];
  else r.due = addDays(dayKey(), BOX_DAYS[r.box]);
}

// ---------- Logros ----------
const anyStars = (s, n) => Object.values(s.levels).some((r) => r.stars >= n);

export const ACHIEVEMENTS = [
  { id: "first", icon: "flag", name: "Hola, mundo", desc: "Completa tu primer nivel", gems: 10, test: (s) => completedCount(s) >= 1 },
  { id: "perfect", icon: "star", name: "Impecable", desc: "Consigue 3 estrellas en un nivel", gems: 10, test: (s) => anyStars(s, 3) },
  { id: "lab1", icon: "terminal", name: "Primer programa", desc: "Supera tu primer laboratorio de código", gems: 20, test: (s) => s.stats.labs >= 1 },
  { id: "boss1", icon: "crown", name: "Matajefes", desc: "Derrota a tu primer jefe", gems: 25, test: (s) => bossesDone(s) >= 1 },
  { id: "worlds3", icon: "map", name: "Trotamundos", desc: "Completa 3 mundos", gems: 50, test: (s) => worldsDone(s) >= 3 },
  { id: "bossAll", icon: "trophy", name: "Conquista total", desc: `Derrota a los ${WORLDS.length} jefes`, gems: 200, test: (s) => bossesDone(s) >= WORLDS.length },
  { id: "stars50", icon: "star", name: "Constelación", desc: "Reúne 50 estrellas", gems: 30, test: (s) => totalStars(s) >= 50 },
  { id: "stars150", icon: "star", name: "Galaxia", desc: "Reúne 150 estrellas", gems: 80, test: (s) => totalStars(s) >= 150 },
  { id: "starsAll", icon: "trophy", name: "Universo perfecto", desc: `Consigue las ${MAX_STARS} estrellas`, gems: 300, test: (s) => totalStars(s) >= MAX_STARS },
  { id: "combo5", icon: "bolt", name: "En racha", desc: "Encadena 5 niveles perfectos seguidos", gems: 30, test: (s) => s.stats.bestCombo >= 5 },
  { id: "speed", icon: "bolt", name: "Relámpago", desc: "Resuelve un nivel en menos de 5 segundos", gems: 15, test: (s, c) => !!c.fast },
  { id: "nohint", icon: "brain", name: "Sin rueditas", desc: "Completa un mundo entero sin usar pistas", gems: 40, test: (s) => WORLDS.some((w) => worldDone(s, w) && !(s.worldHints[w.id] > 0)) },
  { id: "comeback", icon: "heart", name: "Perseverancia", desc: "Supera un nivel que fallaste 3 veces", gems: 20, test: (s, c) => !!c.comeback },
  { id: "streak3", icon: "flame", name: "Calentando motores", desc: "Juega 3 días seguidos", gems: 15, test: (s) => s.streak.best >= 3 },
  { id: "streak7", icon: "flame", name: "Semana de fuego", desc: "Juega 7 días seguidos", gems: 40, test: (s) => s.streak.best >= 7 },
  { id: "streak30", icon: "flame", name: "Imparable", desc: "Juega 30 días seguidos", gems: 150, test: (s) => s.streak.best >= 30 },
  { id: "goal7", icon: "target", name: "Constancia", desc: "Cumple tu meta diaria 7 días", gems: 40, test: (s) => s.goalDays >= 7 },
  { id: "arcade10", icon: "clock", name: "Reflejos", desc: "Acierta 10 en una partida de Contrarreloj", gems: 20, test: (s) => s.arcade.bestCorrect >= 10 },
  { id: "arcade25", icon: "clock", name: "Mente veloz", desc: "Acierta 25 en una partida de Contrarreloj", gems: 60, test: (s) => s.arcade.bestCorrect >= 25 },
  { id: "daily7", icon: "calendar", name: "Cita diaria", desc: "Completa 7 retos diarios", gems: 50, test: (s) => s.daily.done >= 7 },
  { id: "review10", icon: "repeat", name: "Memoria de elefante", desc: "Completa 10 repasos", gems: 30, test: (s) => s.reviewsDone >= 10 },
  { id: "night", icon: "moon", name: "Búho nocturno", desc: "Juega entre la medianoche y las 5 a. m.", gems: 10, test: (s, c) => c.played && c.hour < 5 },
  { id: "early", icon: "sun", name: "Primeros rayos", desc: "Juega entre las 5 y las 7 a. m.", gems: 10, test: (s, c) => c.played && c.hour >= 5 && c.hour < 7 },
  { id: "console", icon: "terminal", name: "Manos a la obra", desc: "Ejecuta tu propio código en la Consola", gems: 5, test: (s, c) => !!c.console },
  { id: "lvl10", icon: "shield", name: "Pythonista", desc: "Llega al nivel 10 de jugador", gems: 50, test: (s) => levelFromXp(s.xp) >= 10 },
  { id: "rich", icon: "gem", name: "Tesoro escondido", desc: "Junta 500 gemas", gems: 0, test: (s) => s.gems >= 500 },
];

export function checkAchievements(s, ctx = {}) {
  const got = [];
  const c = { hour: new Date().getHours(), ...ctx };
  // Dos pasadas: las gemas de un logro pueden desbloquear «Tesoro escondido».
  for (let pass = 0; pass < 2; pass++) {
    for (const a of ACHIEVEMENTS) {
      if (s.ach[a.id]) continue;
      if (a.test(s, c)) {
        s.ach[a.id] = Date.now();
        s.gems += a.gems;
        got.push(a);
      }
    }
  }
  return got;
}

// ---------- Resultados ----------
export function applyLevel(s, lv, run, { mode = "normal" } = {}) {
  const r = s.levels[lv.id] || { stars: 0, best: 0, plays: 0, fails: 0, time: null, done: false };
  const firstClear = !r.done;
  const newStars = Math.max(0, run.stars - r.stars);
  const comeback = firstClear && r.fails >= 3;
  let xp = firstClear ? run.total : Math.round(run.total * (mode === "review" ? 0.5 : 0.3));
  const gems = newStars * 5 + (firstClear && lv.boss ? 20 : 0);

  r.stars = Math.max(r.stars, run.stars);
  r.best = Math.max(r.best, run.total);
  r.plays++;
  r.time = r.time == null ? run.seconds : Math.min(r.time, run.seconds);
  r.done = true;
  s.levels[lv.id] = r;

  const st = s.stats;
  st.runs++;
  st.seconds += Math.round(run.seconds);
  st.hints += run.hints;
  st.bestCombo = Math.max(st.bestCombo, run.combo);
  if (firstClear && lv.t === "code") st.labs++;
  if (firstClear && lv.boss) st.bosses++;
  s.worldHints[lv.world] = (s.worldHints[lv.world] || 0) + run.hints;

  if (mode === "review") {
    s.reviewsDone++;
    if (run.stars === 3) promoteReview(s, lv.id);
    else scheduleReview(s, lv.id);
  } else if (run.stars <= 1) {
    scheduleReview(s, lv.id);
  }

  const lvlBefore = levelFromXp(s.xp);
  s.gems += gems;
  const day = gainXp(s, xp);
  const lvlAfter = levelFromXp(s.xp);
  const achievements = checkAchievements(s, { fast: run.seconds < 5, comeback, played: true });
  return {
    xp, gems, firstClear, newStars, record: r, ...day,
    levelUp: lvlAfter > lvlBefore ? { from: lvlBefore, to: lvlAfter } : null,
    achievements,
  };
}

export function applyFail(s, lv) {
  const r = s.levels[lv.id] || { stars: 0, best: 0, plays: 0, fails: 0, time: null, done: false };
  r.fails++;
  s.levels[lv.id] = r;
  s.stats.runs++;
  if (!s.review[lv.id]) scheduleReview(s, lv.id);
}

export function recordAnswer(s, ok) {
  s.stats.answers++;
  if (ok) s.stats.correct++;
}

export function spendHint(s) {
  if (s.gems < HINT_COST) return false;
  s.gems -= HINT_COST;
  return true;
}

export const canDoDaily = (s) => s.daily.last !== dayKey();

export function applyDaily(s, { score, correct, total }) {
  const lvlBefore = levelFromXp(s.xp);
  const xp = 20 + correct * 5;
  const gems = 15 + (correct === total ? 10 : 0);
  s.daily.last = dayKey();
  s.daily.done++;
  s.daily.best = Math.max(s.daily.best, score);
  s.gems += gems;
  const day = gainXp(s, xp);
  const lvlAfter = levelFromXp(s.xp);
  const achievements = checkAchievements(s, { played: true });
  return { xp, gems, ...day, levelUp: lvlAfter > lvlBefore ? { from: lvlBefore, to: lvlAfter } : null, achievements };
}

export function applyArcade(s, { score, correct }) {
  const lvlBefore = levelFromXp(s.xp);
  const newRecord = score > s.arcade.best;
  const xp = Math.min(Math.round(score / 10), 80);
  const gems = Math.floor(correct / 5) * 2;
  s.arcade.best = Math.max(s.arcade.best, score);
  s.arcade.bestCorrect = Math.max(s.arcade.bestCorrect, correct);
  s.arcade.games++;
  s.gems += gems;
  const day = gainXp(s, xp);
  const lvlAfter = levelFromXp(s.xp);
  const achievements = checkAchievements(s, { played: true });
  return { xp, gems, newRecord, ...day, levelUp: lvlAfter > lvlBefore ? { from: lvlBefore, to: lvlAfter } : null, achievements };
}

// ---------- Tienda ----------
export const FREEZE_COST = 80;
export const FREEZE_MAX = 2;

export const CODE_THEMES = [
  { id: "noche", name: "Noche", price: 0 },
  { id: "volcan", name: "Volcán", price: 150 },
  { id: "matrix", name: "Terminal", price: 150 },
  { id: "papel", name: "Papel", price: 150 },
];

export function buyFreeze(s) {
  if (s.gems < FREEZE_COST || s.streak.freezes >= FREEZE_MAX) return false;
  s.gems -= FREEZE_COST;
  s.streak.freezes++;
  return true;
}

export function buyTheme(s, id) {
  const t = CODE_THEMES.find((x) => x.id === id);
  if (!t || s.owned.themes.includes(id) || s.gems < t.price) return false;
  s.gems -= t.price;
  s.owned.themes.push(id);
  s.settings.codeTheme = id;
  return true;
}
