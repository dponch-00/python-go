import { WORLDS_1 } from "./levels-1.js";
import { WORLDS_2 } from "./levels-2.js";
import { ALGO_WORLDS } from "./algo.js";
import { MAZE_WORLDS } from "./mazes.js";

// Rutas del mapa. Cada mundo pertenece a una.
export const TRACKS = [
  { id: "base", name: "Fundamentos", desc: "Python desde cero" },
  { id: "maze", name: "Laberintos", desc: "Programa a la serpiente",
    pitch: "Escribe el programa que guía a la serpiente: bucles, condiciones y la regla de la mano derecha." },
  { id: "algo", name: "Algoritmos", desc: "Acertijos clásicos de programación",
    pitch: "Búsqueda, ordenamiento, recursión, cifrados y caminos en laberintos." },
];

for (const w of [...WORLDS_1, ...WORLDS_2]) {
  w.track = "base";
  w.short = String(w.id);
}
export const WORLDS = [...WORLDS_1, ...WORLDS_2, ...MAZE_WORLDS, ...ALGO_WORLDS];

// Nombre visible: «Mundo 3» o «Algoritmos 2».
for (const w of WORLDS) {
  const i = WORLDS.filter((x) => x.track === w.track).indexOf(w) + 1;
  w.label = w.track === "algo" ? `Algoritmos ${i}` : w.track === "maze" ? `Laberintos ${i}` : `Mundo ${w.id}`;
}

export const worldsOf = (track) => WORLDS.filter((w) => w.track === track);

// Índices rápidos: nivel por id y lista plana en orden de juego.
export const LEVELS = [];
export const LEVEL_BY_ID = new Map();
export const WORLD_BY_ID = new Map();
for (const w of WORLDS) {
  WORLD_BY_ID.set(w.id, w);
  w.levels.forEach((lv, i) => {
    lv.world = w.id;
    lv.track = w.track;
    lv.tier = w.tier || w.id; // dificultad para la puntuación
    lv.index = i;
    lv.num = i + 1;
    LEVELS.push(lv);
    LEVEL_BY_ID.set(lv.id, lv);
  });
}

export const MAX_STARS = LEVELS.length * 3;

// Nombres visibles de cada tipo de acertijo.
export const TYPE_LABEL = {
  choice: "¿Qué imprime?",
  input: "Escribe la salida",
  fill: "Completa el hueco",
  order: "Ordena el código",
  bug: "Caza el error",
  code: "Laboratorio",
  maze: "Laberinto",
};
