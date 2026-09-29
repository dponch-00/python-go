// Prueba de punta a punta: juega todos los niveles pendientes desde la interfaz, como una persona.
// En los laboratorios escribe la solución y la comprueba con Python real (Pyodide).
//
// Uso (con el juego abierto en http://localhost:8765, en la consola del navegador):
//   const t = await import("/tools/prueba-navegador.js"); t.correr();   // luego: t.estado()
// ¡Ojo! Avanza el progreso del jugador activo: úsalo con un jugador de prueba.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (s) => document.querySelector(s);
async function until(fn, ms = 20000) {
  const t = performance.now();
  while (performance.now() - t < ms) {
    const v = fn();
    if (v) return v;
    await wait(50);
  }
  return null;
}

const results = {};
let running = false;

async function solve(app, lv) {
  app.replace("level", { id: lv.id });
  if (!(await until(() => q(".puzzle"), 3000))) return "no se abrió (¿bloqueado?)";
  if (lv.t === "choice") q(`.opt[data-i="${lv.a}"]`).click();
  else if (lv.t === "input") {
    const i = q(".answer-in");
    i.value = lv.a;
    i.dispatchEvent(new Event("input"));
  } else if (lv.t === "fill") {
    const used = new Set();
    for (const acc of lv.blanks) {
      const idx = lv.bank.findIndex((t, k) => t === acc[0] && !used.has(k));
      used.add(idx);
      q(`.chip-code[data-b="${idx}"]`).click();
    }
  } else if (lv.t === "order") {
    for (let k = 0; k < lv.lines.length; k++) q(`.pool .oline[data-i="${k}"]`).click();
  } else if (lv.t === "bug") q(`.bl[data-n="${lv.line}"]`).click();
  else if (lv.t === "code") {
    if (!(await until(() => q(".py-status.ready"), 30000))) return "Python no cargó";
    const ta = q(".ed-ta");
    ta.value = lv.sol + "\n";
    ta.dispatchEvent(new Event("input"));
  }
  const btn = q('[data-x="check"]');
  if (btn.disabled) return "botón Comprobar deshabilitado";
  btn.click();
  const fb = await until(() => {
    const f = q(".feedback");
    return f && !f.hidden && f.className;
  }, 30000);
  if (!fb) return "sin respuesta";
  if (!fb.includes("good")) return "marcado incorrecto: " + (q(".tests")?.innerText || q(".feedback").innerText).slice(0, 300);
  q(".fb-actions .btn:last-child").click();
  if (!(await until(() => q(".res-title"), 3000))) return "sin pantalla de resultado";
  return "ok";
}

export async function correr({ detenerEnFallo = true } = {}) {
  if (running) return "ya está corriendo";
  running = true;
  const { app } = await import(new URL("../js/main.js", import.meta.url));
  const { LEVELS } = await import(new URL("../js/data/worlds.js", import.meta.url));
  for (const lv of LEVELS) {
    if (app.save.levels[lv.id]?.done) continue;
    try {
      results[lv.id] = await solve(app, lv);
    } catch (e) {
      results[lv.id] = "excepción: " + e.message;
    }
    if (results[lv.id] !== "ok" && detenerEnFallo) break;
  }
  running = false;
  return estado();
}

export function estado() {
  return {
    corriendo: running,
    probados: Object.keys(results).length,
    ultimo: Object.keys(results).at(-1),
    fallos: Object.entries(results).filter(([, v]) => v !== "ok"),
  };
}
