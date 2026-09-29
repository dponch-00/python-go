// Reglas de puntuación, niveles de jugador y rangos.

// Tiempo «par» por tipo de acertijo (segundos). Terminar antes da bono de velocidad.
export const PAR = { choice: 20, input: 25, fill: 30, order: 45, bug: 30, code: 240 };

export const HINT_COST = 10;
export const START_GEMS = 50;
export const HEARTS = 3;
export const REVEAL_AFTER = 3; // fallos en un laboratorio antes de ofrecer la solución

export function baseFor(lv) {
  return (50 + lv.world * 10) * (lv.boss ? 2 : 1);
}

export function starsFor(lv, { mistakes, hints, revealed }) {
  if (revealed) return 1;
  const p = mistakes + hints;
  if (lv.t === "code") return p === 0 ? 3 : p <= 2 ? 2 : 1;
  return p === 0 ? 3 : p === 1 ? 2 : 1;
}

// combo = niveles perfectos seguidos ANTES de este.
export function scoreRun(lv, { mistakes, hints, seconds, combo, revealed }) {
  const stars = starsFor(lv, { mistakes, hints, revealed });
  const perfect = stars === 3;
  const base = baseFor(lv);
  const precision = perfect ? Math.round(base * 0.5) : 0;
  const par = PAR[lv.t] * (1 + lv.world * 0.05);
  const speed = stars >= 2 && seconds < par ? Math.round(base * 0.5 * (1 - seconds / par)) : 0;
  const newCombo = perfect ? combo + 1 : 0;
  const mult = perfect ? 1 + 0.1 * Math.min(newCombo - 1, 5) : 1;
  const total = Math.round((base + precision + speed) * mult);
  return { stars, base, precision, speed, mult, total, combo: newCombo, perfect };
}

// XP acumulada necesaria para llegar al nivel n (nivel 1 = 0 XP).
export const xpForLevel = (n) => 75 * n * (n - 1);

export function levelFromXp(xp) {
  let n = 1;
  while (xpForLevel(n + 1) <= xp) n++;
  return n;
}

export function levelProgress(xp) {
  const n = levelFromXp(xp);
  const from = xpForLevel(n), to = xpForLevel(n + 1);
  return { level: n, into: xp - from, need: to - from, pct: (xp - from) / (to - from) };
}

export const RANKS = [
  [1, "Huevo de pitón"],
  [3, "Culebrilla"],
  [5, "Aprendiz"],
  [7, "Mente lógica"],
  [10, "Pythonista"],
  [13, "Cazabugs"],
  [16, "Leyenda del código"],
  [20, "Gran Pitón"],
];

export function rankFor(level) {
  let name = RANKS[0][1];
  for (const [min, r] of RANKS) if (level >= min) name = r;
  return name;
}

export const DAILY_GOALS = [
  { xp: 30, name: "Casual" },
  { xp: 60, name: "Normal" },
  { xp: 120, name: "Serio" },
  { xp: 200, name: "Intenso" },
];

// Puntos por acierto en Contrarreloj: 10 × dificultad × multiplicador de racha.
export function arcadePoints(tier, streak) {
  const mult = Math.min(1 + Math.floor(streak / 3) * 0.5, 3);
  return { pts: Math.round(10 * tier * mult), mult };
}
export const ARCADE_TIME = 60;
export const ARCADE_BONUS_TIME = 2;
