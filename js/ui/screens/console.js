// Pestaña Consola: zona libre para escribir y ejecutar Python.
import { ensurePython, runPython, onPythonStatus, pythonStatus, explainError } from "../../engine/python.js";
import { checkAchievements } from "../../engine/game.js";
import { esc } from "../dom.js";
import { icon } from "../icons.js";
import { em } from "../emoji.js";
import { py } from "../../data/py.js";
import { createCodeEditor } from "../code-editor.js";
import { sfx } from "../sfx.js";

const EXAMPLES = [
  {
    name: "Hola",
    code: py`
      nombre = "Pythonista"
      print(f"¡Hola, {nombre}!")
      print("Python GO" * 2)
    `,
  },
  {
    name: "Fibonacci",
    code: py`
      a, b = 0, 1
      for _ in range(12):
          print(a, end=" ")
          a, b = b, a + b
    `,
  },
  {
    name: "Dados",
    code: py`
      import random

      tiradas = [random.randint(1, 6) for _ in range(10)]
      print("Tiradas:", tiradas)
      print("Promedio:", sum(tiradas) / len(tiradas))
    `,
  },
  {
    name: "Clases",
    code: py`
      class Mascota:
          def __init__(self, nombre, sonido):
              self.nombre = nombre
              self.sonido = sonido

          def hablar(self):
              return f"{self.nombre} dice {self.sonido}"

      for m in [Mascota("Toby", "guau"), Mascota("Luna", "miau")]:
          print(m.hablar())
    `,
  },
  {
    name: "Primos",
    code: py`
      primos = [n for n in range(2, 60) if all(n % d for d in range(2, int(n ** 0.5) + 1))]
      print(primos)
    `,
  },
];

const key = (s) => `pygo:console:${s.id}`;

export function consoleScreen(main, _params, app) {
  const s = app.save;
  let saved = null;
  try {
    saved = localStorage.getItem(key(s));
  } catch {}

  main.innerHTML = `
    <div class="page console">
      <h1 class="page-title">${em("laptop", "title-em")} Consola</h1>
      <p class="lead">Escribe cualquier código y ejecútalo. Corre en tu propio dispositivo, sin servidor.</p>
      <div class="chips" role="group" aria-label="Ejemplos">
        ${EXAMPLES.map((e, i) => `<button class="chip" data-ex="${i}">${esc(e.name)}</button>`).join("")}
      </div>
      <div class="ed-host"></div>
      <div class="lab-bar">
        <button class="btn primary small" data-x="run">${icon("play")} Ejecutar</button>
        <button class="btn ghost small" data-x="clear">Limpiar</button>
        <span class="py-status" aria-live="polite"></span>
      </div>
      <div class="out" hidden></div>
      <p class="muted small">Atajo: Ctrl + Enter ejecuta. <code class="ic">input()</code> no está disponible: usa variables.</p>
    </div>`;

  const edHost = main.querySelector(".ed-host");
  const edReady = createCodeEditor(edHost, {
    value: saved ?? EXAMPLES[0].code + "\n",
    onChange: (v) => {
      try {
        localStorage.setItem(key(s), v);
      } catch {}
    },
    onRun: () => run(),
    label: "Consola de Python",
  }).then((ed) => (edHost.editor = ed));
  const statusEl = main.querySelector(".py-status");
  const outEl = main.querySelector(".out");

  const paint = (st) => {
    statusEl.className = `py-status ${st}`;
    statusEl.innerHTML =
      st === "loading" ? `<span class="spin"></span> Preparando Python…`
      : st === "ready" ? `${icon("check")} Python listo`
      : st === "error" ? `No se pudo cargar Python. Revisa tu conexión.`
      : "";
  };
  const off = onPythonStatus(paint);
  paint(pythonStatus());
  ensurePython().catch(() => {});

  async function run() {
    sfx.tap();
    const ed = await edReady;
    outEl.hidden = false;
    outEl.innerHTML = `<p class="muted small"><span class="spin"></span> Ejecutando…</p>`;
    let res;
    try {
      res = await runPython(ed.value);
    } catch {
      outEl.innerHTML = `<p class="out-err">No se pudo cargar Python. Revisa tu conexión y vuelve a intentarlo.</p>`;
      return;
    }
    if (res.timeout) {
      outEl.innerHTML = `<p class="out-err"><b>Tiempo agotado.</b> El código tardó más de 8 segundos: ¿hay un bucle infinito?</p>`;
      return;
    }
    const out = res.out ? `<pre class="out-text">${esc(res.out.replace(/\n$/, ""))}</pre>` : `<p class="muted small">(sin salida)</p>`;
    const err = res.err
      ? `<div class="out-err"><b>${esc(res.err.type)}${res.err.line ? ` en la línea ${res.err.line}` : ""}:</b> ${esc(res.err.msg)}<p class="muted">${esc(explainError(res.err))}</p></div>`
      : "";
    outEl.innerHTML = `<p class="out-cap">Salida</p>${out}${err}`;
    ed.markLine(res.err?.line || 0);
    if (!res.err) {
      const got = checkAchievements(s, { console: true });
      if (got.length) {
        app.persist();
        app.hud();
        app.celebrate({ achievements: got });
      }
    }
  }

  main.addEventListener("click", (e) => {
    const ex = e.target.closest("[data-ex]");
    if (ex) {
      sfx.tap();
      edReady.then((ed) => (ed.value = EXAMPLES[+ex.dataset.ex].code + "\n"));
      outEl.hidden = true;
      return;
    }
    const x = e.target.closest("[data-x]")?.dataset.x;
    if (x === "run") run();
    if (x === "clear") {
      edReady.then((ed) => {
        ed.value = "";
        ed.focus();
      });
      outEl.hidden = true;
    }
  });

  return off;
}
