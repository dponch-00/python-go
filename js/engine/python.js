// Puente entre la app y el worker de Python. Carga perezosa: solo se descarga
// Pyodide cuando el jugador abre un laboratorio o la consola.
const TIMEOUT_MS = 8000;

let worker = null;
let readyP = null;
let status = "idle"; // idle | loading | ready | error
let seq = 0;
const waiting = new Map();
const listeners = new Set();

function setStatus(s) {
  status = s;
  listeners.forEach((fn) => fn(s));
}

export const pythonStatus = () => status;
export function onPythonStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function reset(reason) {
  worker?.terminate();
  worker = null;
  readyP = null;
  for (const w of waiting.values()) {
    clearTimeout(w.timer);
    w.reject(new Error(reason));
  }
  waiting.clear();
}

export function ensurePython() {
  if (readyP) return readyP;
  setStatus("loading");
  readyP = new Promise((resolve, reject) => {
    try {
      worker = new Worker(new URL("./py-worker.js", import.meta.url), { type: "module" });
    } catch (err) {
      setStatus("error");
      readyP = null;
      reject(err);
      return;
    }
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "ready") {
        setStatus("ready");
        resolve();
      } else if (m.type === "fail") {
        reset(m.error);
        setStatus("error");
        reject(new Error(m.error));
      } else if (m.type === "result") {
        const w = waiting.get(m.id);
        if (!w) return;
        waiting.delete(m.id);
        clearTimeout(w.timer);
        if (m.error) w.reject(new Error(m.error));
        else w.resolve(m.result);
      }
    };
    worker.onerror = (e) => {
      reset("worker");
      setStatus("error");
      reject(new Error(e.message || "No se pudo iniciar Python"));
    };
    worker.postMessage({ type: "init" });
  });
  return readyP;
}

async function send(msg, timeout) {
  await ensurePython();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiting.delete(id);
      reset("timeout");
      setStatus("idle");
      resolve({ timeout: true });
    }, timeout);
    waiting.set(id, { resolve, reject, timer });
    worker.postMessage({ ...msg, id });
  });
}

// Ejecuta código. Devuelve { out, err, tests } o { timeout: true } si tardó demasiado.
export function runPython(src, { pre = "", tests = [], timeout = TIMEOUT_MS } = {}) {
  return send({ type: "run", src, pre, tests }, timeout);
}

// Ejecuta el programa de la serpiente en cada mapa. Devuelve { mapas: [...], lineas, demasiadas_lineas }.
export function runMaze(src, maps, { maxLines = 0, need = [], timeout = TIMEOUT_MS } = {}) {
  return send({ type: "maze", src, maps, maxLines, need }, timeout);
}

// Traducción amable de los errores más comunes.
const ERR_ES = {
  SyntaxError: "Python no entiende cómo está escrita una línea: revisa paréntesis, comillas y los dos puntos (:).",
  IndentationError: "La sangría no cuadra: los bloques dentro de if, for, def… llevan 4 espacios más.",
  TabError: "Mezclaste tabuladores y espacios en la sangría.",
  NameError: "Usaste un nombre que no existe todavía. ¿Está bien escrito? ¿Lo definiste antes de usarlo?",
  TypeError: "Operación con un tipo equivocado (por ejemplo, sumar texto y número, o llamar a algo que no es función).",
  ValueError: "El valor no sirve para esa operación (por ejemplo, int(\"hola\")).",
  ZeroDivisionError: "Dividiste entre cero.",
  IndexError: "Pediste una posición que no existe en la lista o el texto.",
  KeyError: "Esa clave no existe en el diccionario.",
  AttributeError: "Ese objeto no tiene el atributo o método que llamaste.",
  RecursionError: "La función se llamó a sí misma demasiadas veces: falta un caso base.",
  UnboundLocalError: "Usaste una variable local antes de asignarle un valor.",
  RuntimeError: "Ocurrió un error durante la ejecución.",
};

export function explainError(err) {
  return ERR_ES[err?.type] || "Ocurrió un error al ejecutar tu código.";
}
