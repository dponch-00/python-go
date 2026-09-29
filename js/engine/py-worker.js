// Worker que carga Pyodide (CPython compilado a WebAssembly) y ejecuta el arnés.
// Corre fuera del hilo principal: si el código del jugador se cuelga, la app lo mata y lo reinicia.
export const PYODIDE_URL = "https://cdn.jsdelivr.net/npm/pyodide@314.0.7/";

let runFn = null;

async function init() {
  const { loadPyodide } = await import(PYODIDE_URL + "pyodide.mjs");
  const py = await loadPyodide({ indexURL: PYODIDE_URL });
  const harness = await (await fetch(new URL("./harness.py", import.meta.url))).text();
  py.runPython(harness);
  runFn = py.globals.get("run");
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
  } else if (m.type === "run") {
    try {
      const out = runFn(m.src, m.pre || "", JSON.stringify(m.tests || []));
      self.postMessage({ type: "result", id: m.id, result: JSON.parse(out) });
    } catch (err) {
      self.postMessage({ type: "result", id: m.id, error: String(err?.message || err) });
    }
  }
};
