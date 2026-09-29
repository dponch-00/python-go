// Resaltado de sintaxis de Python, ligero y sin dependencias.
// Garantiza que ningún <span> cruce un salto de línea, para poder partir el HTML por líneas.
import { esc } from "./dom.js";

const KW = new Set(
  "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case".split(" ")
);
const BUILTINS = new Set(
  "print len range int str float bool list dict set tuple type input sum min max abs round sorted reversed enumerate zip map filter any all isinstance super object repr format chr ord divmod pow iter next open Exception ValueError TypeError KeyError IndexError ZeroDivisionError NameError AttributeError RuntimeError StopIteration AssertionError".split(" ")
);

const TOKEN =
  /(#[^\n]*)|((?:[rRbBfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(\b\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?\b)|(@[A-Za-z_]\w*)|([A-Za-z_]\w*)|(\n)|([ \t]+)|(.)/g;

function wrap(cls, text) {
  if (!cls) return esc(text);
  return text
    .split("\n")
    .map((part) => (part ? `<span class="${cls}">${esc(part)}</span>` : ""))
    .join("\n");
}

export function highlight(code) {
  let out = "";
  let prev = "";
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    const [t, com, str, num, deco, word, nl, ws, other] = m;
    if (com) out += wrap("t-c", com);
    else if (str) out += wrap("t-s", str);
    else if (num) out += wrap("t-n", num);
    else if (deco) out += wrap("t-d", deco);
    else if (word) {
      const cls =
        prev === "def" || prev === "class" ? "t-f"
        : KW.has(word) ? "t-k"
        : word === "self" ? "t-self"
        : BUILTINS.has(word) ? "t-b"
        : "";
      out += wrap(cls, word);
      prev = word;
      continue;
    } else if (nl) out += "\n";
    else if (ws) out += ws;
    else if (other) out += wrap("t-o", other);
    if (!ws) prev = t;
  }
  return out;
}

// Bloque de código con números de línea. `mark` = número de línea a resaltar.
export function codeBlock(code, { lines = true, mark = null, cls = "" } = {}) {
  const rows = highlight(code).split("\n");
  return `<pre class="code ${cls}"><code>${rows
    .map((r, i) => `<span class="ln${mark === i + 1 ? " mark" : ""}"${lines ? ` data-n="${i + 1}"` : ""}>${r || " "}</span>`)
    .join("")}</code></pre>`;
}
