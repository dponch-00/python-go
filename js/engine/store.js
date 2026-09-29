// Perfiles y partidas guardadas en localStorage (con respaldo en memoria si no está disponible).
import { START_GEMS } from "./scoring.js";

const PREFIX = "pygo:";
const mem = new Map();

function read(key) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v == null ? mem.get(key) ?? null : JSON.parse(v);
  } catch {
    return mem.get(key) ?? null;
  }
}

function write(key, value) {
  mem.set(key, value);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  mem.delete(key);
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}

// Pide al navegador que no borre los datos por falta de espacio.
export function askPersistence() {
  try {
    navigator.storage?.persist?.();
  } catch {}
}

// ---------- Fechas (en hora local) ----------
export function dayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function dayDiff(a, b) {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}
export function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

// ---------- Perfiles ----------
export const AVATARS = ["🐍", "🦊", "🐼", "🐸", "🦉", "🐙", "🦄", "🐯", "🐧", "🐢", "🦖", "🐝"];

export function newSave({ name, avatar, goal }) {
  const now = Date.now();
  return {
    v: 1,
    id: "p" + now.toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    avatar,
    created: now,
    updated: now,
    xp: 0,
    gems: START_GEMS,
    levels: {},
    worldHints: {},
    streak: { count: 0, best: 0, last: null, freezes: 0 },
    days: {},
    goalDays: 0,
    daily: { last: null, done: 0, best: 0 },
    arcade: { best: 0, games: 0, bestCorrect: 0 },
    review: {},
    reviewsDone: 0,
    ach: {},
    stats: { answers: 0, correct: 0, hints: 0, seconds: 0, labs: 0, bestCombo: 0, bosses: 0, runs: 0 },
    owned: { themes: ["noche"] },
    settings: { sound: true, vibe: true, theme: "auto", codeTheme: "noche", goal: 60, codeSize: 15 },
  };
}

// Completa campos que falten en partidas guardadas con versiones anteriores.
function migrate(save) {
  const base = newSave({ name: save.name, avatar: save.avatar });
  for (const k of Object.keys(base)) {
    if (save[k] === undefined) save[k] = base[k];
    else if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      save[k] = { ...base[k], ...save[k] };
    }
  }
  return save;
}

export function getIndex() {
  return read("index") || { active: null, list: [] };
}

function setIndex(idx) {
  write("index", idx);
}

export function listProfiles() {
  return getIndex().list.map((p) => loadProfile(p.id)).filter(Boolean);
}

export function loadProfile(id) {
  const s = read("p:" + id);
  return s ? migrate(s) : null;
}

export function createProfile(opts) {
  const save = newSave(opts);
  const idx = getIndex();
  idx.list.push({ id: save.id });
  idx.active = save.id;
  setIndex(idx);
  write("p:" + save.id, save);
  return save;
}

export function setActive(id) {
  const idx = getIndex();
  idx.active = id;
  setIndex(idx);
}

export function deleteProfile(id) {
  const idx = getIndex();
  idx.list = idx.list.filter((p) => p.id !== id);
  if (idx.active === id) idx.active = idx.list[0]?.id ?? null;
  setIndex(idx);
  remove("p:" + id);
}

let pending = null;
export function persist(save, now = false) {
  save.updated = Date.now();
  clearTimeout(pending);
  if (now) return write("p:" + save.id, save);
  pending = setTimeout(() => write("p:" + save.id, save), 250);
  return true;
}

export function flush(save) {
  clearTimeout(pending);
  if (save) write("p:" + save.id, save);
}

// ---------- Copia de seguridad ----------
export function exportSave(save) {
  const json = JSON.stringify({ app: "python-go", v: 1, save });
  return "PYGO1:" + btoa(unescape(encodeURIComponent(json)));
}

export function importSave(text) {
  let data;
  const t = text.trim();
  try {
    if (t.startsWith("PYGO1:")) data = JSON.parse(decodeURIComponent(escape(atob(t.slice(6)))));
    else data = JSON.parse(t);
  } catch {
    throw new Error("El código no es válido. Cópialo completo, desde PYGO1: hasta el final.");
  }
  const save = data?.save;
  if (data?.app !== "python-go" || !save?.id || typeof save.xp !== "number") {
    throw new Error("Esto no parece una copia de seguridad de Python GO.");
  }
  const idx = getIndex();
  if (!idx.list.some((p) => p.id === save.id)) idx.list.push({ id: save.id });
  idx.active = save.id;
  setIndex(idx);
  write("p:" + save.id, migrate(save));
  return save;
}
