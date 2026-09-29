"""Comprueba en CPython que cada acertijo sea correcto y no tenga respuestas ambiguas.

Uso:  python tools/verify_levels.py
Sale con código 1 si algún nivel falla.
"""
import importlib.util
import io
import itertools
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding="utf-8")

spec = importlib.util.spec_from_file_location("harness", ROOT / "js" / "engine" / "harness.py")
harness = importlib.util.module_from_spec(spec)
spec.loader.exec_module(harness)
spec = importlib.util.spec_from_file_location("maze", ROOT / "js" / "engine" / "maze.py")
maze = importlib.util.module_from_spec(spec)
spec.loader.exec_module(maze)

STEP_LIMIT = 200_000


class TooLong(Exception):
    pass


def run_limited(src):
    """Ejecuta src con límite de pasos. Devuelve (salida, error o None)."""
    steps = 0

    def tracer(frame, event, arg):
        nonlocal steps
        steps += 1
        if steps > STEP_LIMIT:
            raise TooLong("bucle infinito")
        return tracer

    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    err = None
    try:
        code = compile(src, "<nivel>", "exec")
        sys.settrace(tracer)
        exec(code, ns)
    except BaseException as e:
        err = f"{type(e).__name__}: {e}"
    finally:
        sys.settrace(None)
        sys.stdout = old
    return buf.getvalue(), err


def norm(s):
    return "\n".join(l.rstrip() for l in s.strip("\n").split("\n")).strip()


def fill_code(code, tokens):
    parts = code.split("___")
    out = parts[0]
    for tok, rest in zip(tokens, parts[1:]):
        out += tok + rest
    return out


def check_choice(lv):
    probs = []
    opts = lv["opts"]
    if len(set(map(norm, opts))) != len(opts):
        probs.append("opciones repetidas")
    if lv.get("noRun"):
        return probs
    out, err = run_limited(lv["code"])
    right = opts[lv["a"]]
    if right == "(error)":
        if not err:
            probs.append(f"se esperaba error y salió: {out!r}")
    elif err:
        probs.append(f"error inesperado: {err}")
    elif norm(out) != norm(right):
        probs.append(f"salida real {out!r} ≠ respuesta {right!r}")
    return probs


def check_input(lv):
    out, err = run_limited(lv["code"])
    if err:
        return [f"error inesperado: {err}"]
    if norm(out) != norm(lv["a"]):
        return [f"salida real {out!r} ≠ respuesta {lv['a']!r}"]
    return []


def check_fill(lv):
    probs = []
    code, blanks, bank, goal = lv["code"], lv["blanks"], lv["bank"], lv["goal"]
    if code.count("___") != len(blanks):
        return [f"{code.count('___')} huecos pero {len(blanks)} respuestas"]
    need = {}
    for b in blanks:
        need[b[0]] = need.get(b[0], 0) + 1
    for tok, n in need.items():
        if bank.count(tok) < n:
            probs.append(f"falta {tok!r} en el banco")
    main = [b[0] for b in blanks]
    out, err = run_limited(fill_code(code, main))
    if err or norm(out) != norm(goal):
        probs.append(f"solución da {err or repr(out)} ≠ meta {goal!r}")
    for i, accepted in enumerate(blanks):
        for alt in accepted[1:]:
            toks = main.copy()
            toks[i] = alt
            out, err = run_limited(fill_code(code, toks))
            if err or norm(out) != norm(goal):
                probs.append(f"alternativa {alt!r} no produce la meta")
        for d in set(bank):
            if d in accepted:
                continue
            toks = main.copy()
            toks[i] = d
            out, err = run_limited(fill_code(code, toks))
            if not err and norm(out) == norm(goal):
                probs.append(f"AMBIGUO: el distractor {d!r} en el hueco {i + 1} también da la meta")
    return probs


def check_order(lv):
    head, lines, goal, tail = lv.get("head", []), lv["lines"], lv["goal"], lv.get("tail", [])
    if len(lines) > 9:
        return [f"{len(lines)} líneas para ordenar: usa head/tail para dejar como máximo 9"]
    out, err = run_limited("\n".join(head + lines + tail))
    if err or norm(out) != norm(goal):
        return [f"orden correcto da {err or repr(out)} ≠ meta {goal!r}"]
    valid = set()
    for perm in itertools.permutations(lines):
        if perm in valid:
            continue
        src = "\n".join(head + list(perm) + tail)
        try:
            compile(src, "<p>", "exec")
        except SyntaxError:
            continue
        out, err = run_limited(src)
        if not err and norm(out) == norm(goal):
            valid.add(perm)
    if len(valid) > 1:
        alts = [p for p in valid if list(p) != lines]
        return ["AMBIGUO: otros órdenes también funcionan:\n        " + "\n        ".join(" | ".join(p) for p in alts[:3])]
    return []


def check_bug(lv):
    probs = []
    code_l, fix_l = lv["code"].split("\n"), lv["fix"].split("\n")
    if len(code_l) != len(fix_l):
        probs.append("code y fix deben tener las mismas líneas")
    else:
        diff = [i + 1 for i, (a, b) in enumerate(zip(code_l, fix_l)) if a != b]
        if diff != [lv["line"]]:
            probs.append(f"las líneas distintas son {diff}, pero line = {lv['line']}")
    if code_l[lv["line"] - 1].strip() == "":
        probs.append("la línea marcada está vacía")
    out, err = run_limited(lv["code"])
    if not err and norm(out) == norm(lv["goal"]):
        probs.append("el código con error ya produce la meta")
    out, err = run_limited(lv["fix"])
    if err or norm(out) != norm(lv["goal"]):
        probs.append(f"la corrección da {err or repr(out)} ≠ meta {lv['goal']!r}")
    return probs


def check_code(lv):
    probs = []
    tests = json.dumps(lv["tests"], ensure_ascii=False)
    pre = lv.get("pre", "")
    res = json.loads(harness.run(lv["sol"], pre, tests))
    if res["err"]:
        probs.append(f"la solución falla: {res['err']}")
    for t in res["tests"]:
        if not t["ok"]:
            probs.append(f"la solución no pasa «{t['msg']}» (obtuvo {t['got']!r})")
    # El código inicial puede ser lento a propósito (p. ej. recursión sin memoria): se corta por pasos.
    res = json.loads(with_step_limit(lambda: harness.run(lv["starter"], pre, tests)))
    if all(t["ok"] for t in res["tests"]):
        probs.append("el código inicial ya pasa todas las pruebas")
    return probs


def with_step_limit(fn, limit=2_000_000):
    steps = 0

    # Solo cuenta (y corta) dentro del código del jugador; cada prueba lenta se corta por separado.
    def tracer(frame, event, arg):
        nonlocal steps
        if frame.f_code.co_filename != harness.FILE:
            return tracer
        steps += 1
        if steps > limit:
            steps = 0
            raise TooLong("demasiado lento")
        return tracer

    sys.settrace(tracer)
    try:
        return fn()
    finally:
        sys.settrace(None)


def check_maze(lv):
    probs = []
    maps = json.dumps(lv["maps"], ensure_ascii=False)
    need = json.dumps(lv.get("need", []))
    for m in lv["maps"]:
        cells = "".join(m["filas"])
        if cells.count("S") != 1:
            probs.append("cada mapa necesita exactamente una S")
        if "G" not in cells and "A" not in cells:
            probs.append("el mapa no tiene meta ni manzanas")
        widths = {len(f) for f in m["filas"]}
        if len(widths) != 1:
            probs.append(f"filas de distinto ancho: {sorted(widths)}")
    res = json.loads(maze.correr_laberinto(lv["sol"], maps, lv.get("maxLines", 0), need))
    for i, r in enumerate(res["mapas"], 1):
        if not r["ok"]:
            probs.append(f"la solución falla en el mapa {i}: {r['falla']}")
    if res["demasiadas_lineas"]:
        probs.append(f"la solución usa {res['lineas']} líneas (máximo {lv['maxLines']})")
    if res["falta_funcion"]:
        probs.append("la solución no usa lo que el nivel exige")
    res = json.loads(with_step_limit(lambda: maze.correr_laberinto(lv["starter"], maps, lv.get("maxLines", 0), need)))
    if all(r["ok"] for r in res["mapas"]) and not res["demasiadas_lineas"] and not res["falta_funcion"]:
        probs.append("el código inicial ya resuelve el nivel")
    return probs


CHECKS = {
    "maze": check_maze,
    "choice": check_choice,
    "input": check_input,
    "fill": check_fill,
    "order": check_order,
    "bug": check_bug,
    "code": check_code,
}
REQUIRED = {
    "choice": ["code", "opts", "a"],
    "input": ["code", "a"],
    "fill": ["code", "blanks", "bank", "goal"],
    "order": ["lines", "goal"],
    "bug": ["code", "line", "fix", "goal"],
    "code": ["starter", "tests", "sol", "goal"],
    "maze": ["maps", "starter", "sol", "api"],
}


def main():
    raw = subprocess.run(
        ["node", str(ROOT / "tools" / "export-levels.mjs")],
        capture_output=True, check=True, cwd=ROOT,
    ).stdout.decode("utf-8")
    worlds = json.loads(raw)
    seen, total, bad = set(), 0, 0
    for w in worlds:
        print(f"\nMundo {w['id']}: {w['name']}")
        for lv in w["levels"]:
            total += 1
            probs = []
            if lv["id"] in seen:
                probs.append("id repetido")
            seen.add(lv["id"])
            for f in ["title", "q", "hint", "why"] + REQUIRED.get(lv["t"], []):
                if f not in lv:
                    probs.append(f"falta el campo {f!r}")
            if not probs:
                probs = CHECKS[lv["t"]](lv)
            mark = "✗" if probs else "✓"
            print(f"  {mark} {lv['id']:>5} {lv['t']:<6} {lv['title']}")
            for p in probs:
                print(f"        → {p}")
            bad += bool(probs)
    print(f"\n{total - bad}/{total} niveles correctos")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
