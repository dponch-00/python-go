import { WORLDS_1 } from "./levels-1.js";
import { WORLDS_2 } from "./levels-2.js";

export const WORLDS = [...WORLDS_1, ...WORLDS_2];

// Índices rápidos: nivel por id y lista plana en orden de juego.
export const LEVELS = [];
export const LEVEL_BY_ID = new Map();
for (const w of WORLDS) {
  w.levels.forEach((lv, i) => {
    lv.world = w.id;
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
};
