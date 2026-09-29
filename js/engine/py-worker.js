// Worker que carga Pyodide (CPython compilado a WebAssembly) y ejecuta el arnés.
// Corre fuera del hilo principal: si el código del jugador se cuelga, la app lo mata y lo reinicia.
export const PYODIDE_URL = "https://cdn.jsdelivr.net/npm/pyodide@314.0.7/";

let runFn = null;
let mazeFn = null;

async function init() {
  const { loadPyodide } = await import(PYODIDE_URL + "pyodide.mjs");
  const py = await loadPyodide({ indexURL: PYODIDE_URL });
  const [harness, maze] = await Promise.all(
    ["./harness.py", "./maze.py"].map(async (f) => (await fetch(new URL(f, import.meta.url))).text())
  );
  py.runPython(harness);
  runFn = py.globals.get("run");
  // El simulador de laberintos vive en su propio módulo para no mezclar nombres.
  py.FS.writeFile("/home/pyodide/maze.py", maze);
  py.runPython("import sys\nsys.path.insert(0, '/home/pyodide')\nfrom maze import correr_laberinto");
  mazeFn = py.globals.get("correr_laberinto");
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === "init") {
    try {
      await init();
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "fail", error: String(err?.message || err) });
    }
  } else if (m.type === "run" || m.type === "maze") {
    try {
      const out =
        m.type === "run"
          ? runFn(m.src, m.pre || "", JSON.stringify(m.tests || []))
          : mazeFn(m.src, JSON.stringify(m.maps), m.maxLines || 0, JSON.stringify(m.need || []));
      self.postMessage({ type: "result", id: m.id, result: JSON.parse(out) });
    } catch (err) {
      self.postMessage({ type: "result", id: m.id, error: String(err?.message || err) });
    }
  }
};
