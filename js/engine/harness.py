# Arnés que ejecuta el código del jugador y sus pruebas.
# Lo usan el worker de Pyodide (en el navegador) y tools/verify_levels.py (en CPython),
# así las respuestas se comprueban exactamente igual en los dos lados.
import ast
import io
import json
import sys
import traceback

FILE = "<tu código>"


def _no_input(*_args):
    raise RuntimeError("input() no está disponible aquí: usa variables con valores fijos.")


def _fmt_error(e):
    line = None
    if isinstance(e, SyntaxError):
        if e.filename == FILE:
            line = e.lineno
        msg = e.msg
    else:
        for fr in traceback.extract_tb(e.__traceback__):
            if fr.filename == FILE:
                line = fr.lineno
        msg = str(e)
    return {"type": type(e).__name__, "msg": msg, "line": line}


def _exec(pre, src):
    ns = {"__name__": "__main__", "input": _no_input}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    err = None
    try:
        if pre:
            exec(compile(pre, "<datos>", "exec"), ns)
        exec(compile(src, FILE, "exec"), ns)
    except BaseException as e:  # también SystemExit y KeyboardInterrupt
        err = _fmt_error(e)
    finally:
        sys.stdout = old
    return ns, buf.getvalue(), err


def _norm(s):
    return "\n".join(l.rstrip() for l in s.strip("\n").split("\n")).strip()


def _quiet(fn):
    """Ejecuta fn sin que sus print ensucien la salida principal."""
    old = sys.stdout
    sys.stdout = io.StringIO()
    try:
        return fn()
    finally:
        sys.stdout = old


def _ast_uses(src, kinds):
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return False
    return any(type(n).__name__ in kinds for n in ast.walk(tree))


def _ast_calls(src, name):
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return False
    for n in ast.walk(tree):
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == name:
            return True
    return False


def _ast_attr_calls(src, name):
    """¿Se llama a un método con ese nombre? (p. ej. lista.sort())"""
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return False
    return any(
        isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == name
        for n in ast.walk(tree)
    )


def _ast_imports(src, module):
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return False
    for n in ast.walk(tree):
        if isinstance(n, ast.Import) and any(a.name.split(".")[0] == module for a in n.names):
            return True
        if isinstance(n, ast.ImportFrom) and (n.module or "").split(".")[0] == module:
            return True
    return False


def _ast_recursive(src, fname):
    """¿La función fname se llama a sí misma dentro de su cuerpo?"""
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == fname:
            for m in ast.walk(n):
                if isinstance(m, ast.Call) and isinstance(m.func, ast.Name) and m.func.id == fname:
                    return True
    return False


def _default_msg(t):
    if "ex" in t:
        return f"{t['ex']} → {t['eq']}"
    if "out" in t:
        return "La salida es correcta"
    return "Prueba"


def run(src, pre="", tests_json="[]"):
    tests = json.loads(tests_json)
    runs = {}

    def get_run(p):
        if p not in runs:
            runs[p] = _exec(p, src)
        return runs[p]

    base_ns, base_out, base_err = get_run(pre)
    results = []
    for t in tests:
        r = {"msg": t.get("msg") or _default_msg(t), "ok": False, "got": None}
        if "uses" in t:
            r["ok"] = _ast_uses(src, t["uses"])
            if not r["ok"]:
                r["got"] = "No se encontró en tu código"
            results.append(r)
            continue
        if "noCall" in t:
            r["ok"] = not _ast_calls(src, t["noCall"])
            if not r["ok"]:
                r["got"] = f"Tu código usa {t['noCall']}()"
            results.append(r)
            continue
        if "noAttr" in t:
            r["ok"] = not _ast_attr_calls(src, t["noAttr"])
            if not r["ok"]:
                r["got"] = f"Tu código usa .{t['noAttr']}()"
            results.append(r)
            continue
        if "noImport" in t:
            r["ok"] = not _ast_imports(src, t["noImport"])
            if not r["ok"]:
                r["got"] = f"Tu código importa {t['noImport']}"
            results.append(r)
            continue
        if "bans" in t:
            r["ok"] = not _ast_uses(src, t["bans"])
            if not r["ok"]:
                r["got"] = "Tu código usa algo que este reto no permite"
            results.append(r)
            continue
        if "recursive" in t:
            r["ok"] = _ast_recursive(src, t["recursive"])
            if not r["ok"]:
                r["got"] = f"{t['recursive']} no se llama a sí misma"
            results.append(r)
            continue

        ns, out, err = get_run(t.get("pre", pre))
        if err:
            r["got"] = f"{err['type']}: {err['msg']}"
            results.append(r)
            continue
        try:
            if "out" in t:
                r["ok"] = _norm(out) == _norm(t["out"])
                r["got"] = out.strip("\n")
            elif "ex" in t:
                v = _quiet(lambda: eval(t["ex"], ns))
                r["got"] = repr(v)
                r["ok"] = r["got"] == t["eq"]
            elif "check" in t:
                ns["salida"] = out
                r["ok"] = bool(_quiet(lambda: eval(t["check"], ns)))
                if not r["ok"]:
                    r["got"] = "No se cumple"
            elif "run" in t:
                _quiet(lambda: exec(t["run"], ns))
                r["ok"] = True
        except AssertionError as e:
            r["got"] = str(e) or "La comprobación no se cumplió"
        except BaseException as e:
            r["got"] = f"{type(e).__name__}: {e}"
        results.append(r)

    return json.dumps(
        {"out": base_out, "err": base_err, "tests": results},
        ensure_ascii=False,
    )
