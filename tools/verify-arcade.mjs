// Genera miles de preguntas del modo Contrarreloj y las contrasta con CPython.
// Uso: node tools/verify-arcade.mjs
import { spawnSync } from "node:child_process";
import { makeRng, genQuestion, dailyQuestions } from "../js/engine/arcade.js";

const qs = [];
for (const tier of [1, 2, 3]) {
  const r = makeRng(1000 + tier);
  for (let i = 0; i < 1500; i++) qs.push(genQuestion(r, tier));
}
for (let d = 1; d <= 60; d++) qs.push(...dailyQuestions(`2026-10-${String(d).padStart(2, "0")}`));

let bad = 0;
for (const q of qs) {
  if (q.options.length !== 4 || new Set(q.options).size !== 4 || !q.options.includes(q.answer)) {
    bad++;
    console.log("Opciones inválidas:", q);
  }
}

const PY = `
import sys, io, json
sys.stdout.reconfigure(encoding="utf-8")
qs = json.loads(sys.stdin.buffer.read().decode("utf-8"))
bad = 0
for q in qs:
    buf = io.StringIO(); old = sys.stdout; sys.stdout = buf
    try:
        exec(q["code"], {})
        out = buf.getvalue().rstrip("\\n")
    except Exception as e:
        out = "(error)"
    finally:
        sys.stdout = old
    if out != q["answer"]:
        bad += 1
        print("DISTINTO:", repr(q["code"]), "Python:", repr(out), "juego:", repr(q["answer"]))
    elif sum(o == out for o in q["options"]) != 1:
        bad += 1
        print("AMBIGUO:", q)
print(f"{len(qs) - bad}/{len(qs)} coinciden con CPython")
sys.exit(1 if bad else 0)
`;
const res = spawnSync("python", ["-c", PY], { input: JSON.stringify(qs), encoding: "utf-8" });
process.stdout.write(res.stdout);
process.stderr.write(res.stderr);
process.exit(bad || res.status ? 1 : 0);
