// Editor de código: textarea transparente sobre un <pre> resaltado.
// Sangría automática, Tab = 4 espacios y barra de símbolos para el celular.
import { highlight } from "./highlight.js";

const KEYS = ["⇥", ":", "(", ")", "[", "]", "{", "}", '"', "'", "=", "+", "-", "*", "/", "%", "<", ">", "_", ".", ",", "#"];

export function createEditor(host, { value = "", onChange = () => {}, onRun = null, label = "Editor de código" } = {}) {
  host.innerHTML = `
    <div class="editor">
      <div class="ed-scroll">
        <div class="ed-gutter" aria-hidden="true"></div>
        <div class="ed-area">
          <pre class="ed-hl code" aria-hidden="true"><code></code></pre>
          <textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"
            wrap="off" aria-label="${label}"></textarea>
        </div>
      </div>
      <div class="keybar" role="toolbar" aria-label="Símbolos">
        ${KEYS.map((k) => `<button type="button" tabindex="-1" data-k="${k === '"' ? "&quot;" : k}">${k === "⇥" ? "Tab" : k}</button>`).join("")}
      </div>
    </div>`;
  const ta = host.querySelector(".ed-ta");
  const hl = host.querySelector(".ed-hl code");
  const gutter = host.querySelector(".ed-gutter");
  const area = host.querySelector(".ed-area");
  ta.value = value;

  function refresh() {
    const v = ta.value;
    hl.innerHTML = highlight(v) + "\n";
    const lines = v.split("\n");
    gutter.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join("");
    const longest = Math.max(...lines.map((l) => l.length), 10);
    area.style.width = `calc(${longest + 3}ch + var(--ed-pad) * 2)`;
    area.style.height = `calc(${lines.length} * var(--ed-lh) + var(--ed-pad) * 2)`;
  }

  function insert(text) {
    ta.focus();
    // execCommand conserva el historial de deshacer; setRangeText es el respaldo.
    if (!document.execCommand?.("insertText", false, text)) {
      const { selectionStart: s, selectionEnd: e } = ta;
      ta.setRangeText(text, s, e, "end");
      ta.dispatchEvent(new Event("input"));
    }
  }

  function currentLine() {
    const s = ta.selectionStart;
    const start = ta.value.lastIndexOf("\n", s - 1) + 1;
    return { start, text: ta.value.slice(start, s) };
  }

  ta.addEventListener("input", () => {
    refresh();
    onChange(ta.value);
  });

  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onRun) {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const { start, text } = currentLine();
        const n = Math.min(4, text.match(/^ */)[0].length);
        if (n) {
          ta.setSelectionRange(start, start + n);
          insert("");
        }
      } else insert("    ");
    } else if (e.key === "Enter") {
      e.preventDefault();
      const { text } = currentLine();
      let indent = text.match(/^ */)[0];
      if (/:\s*(#.*)?$/.test(text)) indent += "    ";
      insert("\n" + indent);
    } else if (e.key === "Backspace" && ta.selectionStart === ta.selectionEnd) {
      const { text } = currentLine();
      if (text.length && /^ +$/.test(text)) {
        e.preventDefault();
        const n = text.length % 4 || 4;
        ta.setSelectionRange(ta.selectionStart - n, ta.selectionStart);
        insert("");
      }
    }
  });

  // Evita que la barra de símbolos robe el foco (y cierre el teclado del celular).
  host.querySelector(".keybar").addEventListener("pointerdown", (e) => e.preventDefault());
  host.querySelector(".keybar").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    const k = b.dataset.k;
    insert(k === "⇥" ? "    " : k);
  });

  refresh();
  return {
    get value() {
      return ta.value;
    },
    set value(v) {
      ta.value = v;
      refresh();
      onChange(v);
    },
    focus: () => ta.focus(),
    markLine(n) {
      [...gutter.children].forEach((s, i) => s.classList.toggle("err", i + 1 === n));
    },
  };
}
