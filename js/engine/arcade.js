// Generador procedural de preguntas «¿Qué imprime?» para Contrarreloj y Reto diario.
// Todas las respuestas se calculan con la semántica exacta de Python
// (tools/verify-arcade.mjs las contrasta con CPython).

export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

// --- Formato de valores igual que Python ---
const pyFloorDiv = (a, b) => Math.floor(a / b);
const pyMod = (a, b) => a - b * Math.floor(a / b);
const pyFloat = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const pyStrRepr = (s) => (s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s}'`);
const pyRepr = (v) =>
  typeof v === "string" ? pyStrRepr(v)
  : Array.isArray(v) ? `[${v.map(pyRepr).join(", ")}]`
  : typeof v === "boolean" ? (v ? "True" : "False")
  : v === null ? "None"
  : String(v);
const pyList = (arr) => pyRepr(arr);
const bool = (b) => (b ? "True" : "False");
// round() de Python redondea los .5 al par más cercano.
const pyRoundHalf = (x) => {
  const f = Math.floor(x);
  const d = x - f;
  if (d < 0.5) return f;
  if (d > 0.5) return f + 1;
  return f % 2 === 0 ? f : f + 1;
};

const WORDS = ["python", "codigo", "juego", "bucle", "lista", "clave", "texto", "nivel", "puntos", "robot", "datos", "piton", "teclado", "pantalla"];
const LONG = ["programa", "variable", "funcion", "compilar", "algoritmo", "terminal"];

// Cada plantilla devuelve { code, answer, wrong[] } (answer y wrong como texto impreso).
const T1 = [
  (r) => {
    const a = ri(r, 2, 20), b = ri(r, 2, 20);
    return { code: `print(${a} + ${b})`, answer: String(a + b), wrong: [String(a + b + 1), `${a}${b}`, String(a * b), String(a + b - 1)] };
  },
  (r) => {
    const a = ri(r, 1, 9), b = ri(r, 1, 9);
    return { code: `print("${a}" + "${b}")`, answer: `${a}${b}`, wrong: [String(a + b), `${a} + ${b}`, `"${a}${b}"`, "(error)"] };
  },
  (r) => {
    const s = pick(r, ["ab", "na", "jo", "py", "ha"]), n = ri(r, 2, 4);
    return { code: `print("${s}" * ${n})`, answer: s.repeat(n), wrong: [`${s}${n}`, Array(n).fill(s).join(" "), s.repeat(n + 1), "(error)"] };
  },
  (r) => {
    const w = pick(r, WORDS);
    return { code: `print(len("${w}"))`, answer: String(w.length), wrong: [String(w.length - 1), String(w.length + 1), w, String(w.length + 2)] };
  },
  (r) => {
    const w = pick(r, WORDS), i = ri(r, 1, w.length - 2);
    return { code: `print("${w}"[${i}])`, answer: w[i], wrong: [w[i - 1], w[i + 1], w[i].toUpperCase(), "(error)"] };
  },
  (r) => {
    const a = ri(r, 1, 30), b = ri(r, 1, 30), op = pick(r, [">", "<", "==", "!="]);
    const v = op === ">" ? a > b : op === "<" ? a < b : op === "==" ? a === b : a !== b;
    return { code: `print(${a} ${op} ${b})`, answer: bool(v), wrong: [bool(!v), "None", "(error)"] };
  },
  (r) => {
    const a = ri(r, 2, 9), b = ri(r, 1, 9);
    return { code: `print(int("${a}") + ${b})`, answer: String(a + b), wrong: [`${a}${b}`, "(error)", String(a), String(a + b + 1)] };
  },
];

const T2 = [
  (r) => {
    const b = ri(r, 2, 9), a = ri(r, 11, 60);
    const q = pyFloorDiv(a, b);
    return { code: `print(${a} // ${b})`, answer: String(q), wrong: [pyFloat(a / b), String(q + 1), String(pyMod(a, b)), String(q - 1)] };
  },
  (r) => {
    const b = ri(r, 2, 9), a = ri(r, 11, 60);
    const m = pyMod(a, b);
    return { code: `print(${a} % ${b})`, answer: String(m), wrong: [String(pyFloorDiv(a, b)), String(m + 1), pyFloat(a / b), String(b - m === m ? m + 2 : b - m)] };
  },
  (r) => {
    const b = pick(r, [2, 4, 5, 8]), a = ri(r, 3, 40);
    const v = a / b;
    return { code: `print(${a} / ${b})`, answer: pyFloat(v), wrong: [String(pyFloorDiv(a, b)), pyFloat(v + 1), Number.isInteger(v) ? String(v) : pyFloat(Math.round(v)), pyFloat(v / 2)] };
  },
  (r) => {
    const a = ri(r, 2, 5), b = ri(r, 2, 3);
    return { code: `print(${a} ** ${b})`, answer: String(a ** b), wrong: [String(a * b), String(a ** (b + 1)), String(b ** a), String(a + b)] };
  },
  (r) => {
    const w = pick(r, WORDS), i = ri(r, 1, 3);
    return { code: `print("${w}"[-${i}])`, answer: w[w.length - i], wrong: [w[w.length - i - 1], w[i], w[w.length - i + 1] ?? w[0], "(error)"] };
  },
  (r) => {
    const w = pick(r, LONG), a = ri(r, 0, 3), b = ri(r, a + 2, a + 4);
    return { code: `print("${w}"[${a}:${b}])`, answer: w.slice(a, b), wrong: [w.slice(a, b + 1), w.slice(a + 1, b + 1), w.slice(a, b - 1), w.slice(a + 1, b)] };
  },
  (r) => {
    const s = pick(r, ["hola mundo", "buenos dias", "python es genial", "modo arcade"]);
    const m = pick(r, ["upper", "title", "capitalize"]);
    const title = s.split(" ").map((x) => x[0].toUpperCase() + x.slice(1)).join(" ");
    const cap = s[0].toUpperCase() + s.slice(1);
    const answer = m === "upper" ? s.toUpperCase() : m === "title" ? title : cap;
    return { code: `print("${s}".${m}())`, answer, wrong: [s.toUpperCase(), title, cap, s] };
  },
  (r) => {
    const opts = [["[1, [2, 3], 4]", 3], ["[[1, 2], [3, 4]]", 2], ["[0, 0, 0, 0]", 4], ["[[], [], 5]", 3], ['["a", "bc", "def"]', 3]];
    const [lit, n] = pick(r, opts);
    return { code: `print(len(${lit}))`, answer: String(n), wrong: [String(n + 1), String(n - 1), String(n + 2), "(error)"] };
  },
  (r) => {
    const arr = [ri(r, 1, 9) * 10, ri(r, 1, 9) * 10, ri(r, 1, 9) * 10, ri(r, 1, 9) * 10];
    const i = ri(r, 0, 3);
    return { code: `print(${pyList(arr)}[${i}])`, answer: String(arr[i]), wrong: [String(arr[(i + 1) % 4]), String(arr[(i + 3) % 4]), "(error)", String(i)] };
  },
  (r) => {
    const cases = [
      ['"py" in "python"', true], ['"on" in "python"', true], ['"Py" in "python"', false],
      ["3 in [1, 2, 3]", true], ["4 in [1, 2, 3]", false], ['"a" not in "casa"', false],
    ];
    const [e, v] = pick(r, cases);
    return { code: `print(${e})`, answer: bool(v), wrong: [bool(!v), "None", "(error)"] };
  },
  (r) => {
    const a = ri(r, 1, 5), b = ri(r, 6, 9);
    return { code: `print([${a}, ${b}] + [${a + b}])`, answer: pyList([a, b, a + b]), wrong: [`[${a}, ${b}, [${a + b}]]`, pyList([a + b, a, b]), `[${a + a + b}, ${b}]`, "(error)"] };
  },
  (r) => {
    const arr = Array.from({ length: 4 }, () => ri(r, 1, 15));
    const f = pick(r, ["max", "min", "sum"]);
    const s = arr.reduce((x, y) => x + y, 0), mx = Math.max(...arr), mn = Math.min(...arr);
    const answer = String(f === "max" ? mx : f === "min" ? mn : s);
    return { code: `print(${f}(${pyList(arr)}))`, answer, wrong: [String(mx), String(mn), String(s), String(arr[0]), String(arr[3])] };
  },
  (r) => {
    const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 5);
    return { code: `print(${a} + ${b} * ${c})`, answer: String(a + b * c), wrong: [String((a + b) * c), String(a + b + c), String(a * b + c), String(a * c + b)] };
  },
];

const T3 = [
  (r) => {
    const b = ri(r, 2, 5);
    let a = ri(r, 3, 20);
    if (a % b === 0) a += 1;
    const q = pyFloorDiv(-a, b);
    return { code: `print(-${a} // ${b})`, answer: String(q), wrong: [String(q + 1), pyFloat(-a / b), String(-q), String(q - 1)] };
  },
  (r) => {
    const b = ri(r, 3, 7);
    let a = ri(r, 3, 20);
    if (a % b === 0) a += 1;
    const m = pyMod(-a, b);
    return { code: `print(-${a} % ${b})`, answer: String(m), wrong: [String(-(a % b)), String(a % b === m ? m + 1 : a % b), String(-m), String(pyFloorDiv(-a, b))] };
  },
  (r) => {
    const x = ri(r, 0, 9) + 0.5;
    const v = pyRoundHalf(x);
    const other = v === Math.floor(x) ? v + 1 : v - 1;
    return { code: `print(round(${x}))`, answer: String(v), wrong: [String(other), pyFloat(v), String(x), String(v + 2)] };
  },
  (r) => {
    const w = pick(r, [...WORDS, ...LONG]);
    const rev = [...w].reverse().join("");
    return { code: `print("${w}"[::-1])`, answer: rev, wrong: [w, rev.slice(1) + rev[0], w.slice(1), rev.toUpperCase()] };
  },
  (r) => {
    const parts = pick(r, [["a", "b", "c"], ["x", "y"], ["uno", "dos", "tres"], ["rojo", "azul"]]);
    const sep = pick(r, ["-", ",", "/"]);
    const s = parts.join(sep);
    return { code: `print("${s}".split("${sep}"))`, answer: pyList(parts), wrong: [pyList([s]), parts.join(" "), pyList(parts.flatMap((p, i) => (i ? [sep, p] : [p]))), `(${parts.map(pyRepr).join(", ")})`] };
  },
  (r) => {
    const arr = [ri(r, 1, 9), ri(r, 10, 19), ri(r, 20, 29)].sort(() => r() - 0.5);
    const rev = r() < 0.5;
    const sorted = [...arr].sort((x, y) => x - y);
    if (rev) sorted.reverse();
    return { code: `print(sorted(${pyList(arr)}${rev ? ", reverse=True" : ""}))`, answer: pyList(sorted), wrong: [pyList(arr), pyList([...sorted].reverse()), "None", pyList([...arr].reverse())] };
  },
  (r) => {
    const a = ri(r, 0, 4), s = ri(r, 2, 3), b = a + s * ri(r, 2, 4);
    const out = [];
    for (let i = a; i < b; i += s) out.push(i);
    const incl = [...out, b];
    return { code: `print(list(range(${a}, ${b}, ${s})))`, answer: pyList(out), wrong: [pyList(incl), pyList(out.slice(1)), pyList(out.slice(0, -1)), pyList(out.map((x) => x + 1))] };
  },
  (r) => {
    const cases = [['""', false], ['"0"', true], ["0", false], ["[]", false], ["[0]", true], ["None", false], ['" "', true], ["0.0", false], ["-1", true]];
    const [lit, v] = pick(r, cases);
    return { code: `print(bool(${lit}))`, answer: bool(v), wrong: [bool(!v), "None", "(error)"] };
  },
  (r) => {
    const cases = [["3 == 3.0", true], ['"3" == 3', false], ["0.1 + 0.2 == 0.3", false], ["1 == True", true], ['"a" < "b"', true], ['"Z" < "a"', true], ['"abc" < "abd"', true], ['"10" < "9"', true], ["[1, 2] == [2, 1]", false]];
    const [e, v] = pick(r, cases);
    return { code: `print(${e})`, answer: bool(v), wrong: [bool(!v), "None", "(error)"] };
  },
  (r) => {
    const n = ri(r, 1, 9), d = pick(r, [1, 2, 5, 9]), neg = r() < 0.4;
    const x = `${neg ? "-" : ""}${n}.${d}`;
    const v = neg ? -n : n;
    return { code: `print(int(${x}))`, answer: String(v), wrong: [String(neg ? v - 1 : v + 1), x, "(error)", pyFloat(v)] };
  },
  (r) => {
    const a = ri(r, 1, 9), b = ri(r, 1, 12), x = ri(r, 0, 13);
    const v = a < x && x < b;
    return { code: `x = ${x}\nprint(${a} < x < ${b})`, answer: bool(v), wrong: [bool(!v), "(error)", "None"] };
  },
  (r) => {
    const w = pick(r, ["banana", "manzana", "cocodrilo", "abracadabra", "mississippi"]);
    const ch = pick(r, [...new Set(w)]);
    const n = w.split(ch).length - 1;
    return { code: `print("${w}".count("${ch}"))`, answer: String(n), wrong: [String(n + 1), String(n - 1 || n + 2), String(w.indexOf(ch)), String(w.length)] };
  },
  (r) => {
    const [lit, shown] = pick(r, [["0", "0"], ["1", "1"], ['"0"', "'0'"], ['""', "''"], ["None", "None"]]);
    const n = ri(r, 2, 4);
    return { code: `print([${lit}] * ${n})`, answer: `[${Array(n).fill(shown).join(", ")}]`, wrong: [`[${shown}]`, `[${Array(n + 1).fill(shown).join(", ")}]`, `[${shown}, ${n}]`, "(error)"] };
  },
  (r) => {
    const x = pick(r, [3.14159, 2.71828, 1.41421, 9.87654, 0.33333, 12.3456]);
    const d = pick(r, [1, 2]);
    const ans = x.toFixed(d);
    return { code: `print(f"{${x}:.${d}f}")`, answer: ans, wrong: [x.toFixed(d + 1), String(x), x.toFixed(d === 1 ? 0 : 1), "(error)"] };
  },
];

const TIERS = { 1: T1, 2: T2, 3: T3 };

function shuffle(r, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function genQuestion(r, tier) {
  const q = pick(r, TIERS[tier])(r);
  const wrong = [];
  for (const w of q.wrong) {
    if (w !== undefined && w !== q.answer && !wrong.includes(w)) wrong.push(w);
  }
  for (const f of ["(error)", "None", "0", "True", "False"]) {
    if (wrong.length >= 3) break;
    if (f !== q.answer && !wrong.includes(f)) wrong.push(f);
  }
  return { code: q.code, answer: q.answer, options: shuffle(r, [q.answer, ...wrong.slice(0, 3)]), tier };
}

// Dificultad según el número de pregunta dentro de la partida.
export function tierFor(r, n) {
  if (n < 4) return 1;
  if (n < 10) return r() < 0.6 ? 2 : 1;
  if (n < 18) return r() < 0.55 ? 2 : 3;
  return r() < 0.75 ? 3 : 2;
}

export const DAILY_COUNT = 8;
export function dailyQuestions(dateKey) {
  const r = makeRng(seedFromString("pygo-" + dateKey));
  const tiers = [1, 1, 2, 2, 2, 3, 3, 3];
  return tiers.map((t) => genQuestion(r, t));
}
