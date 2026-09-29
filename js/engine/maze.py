# Simulador de los Laberintos de la serpiente.
# El código del jugador llama a avanzar(), girar_izquierda(), comer()…; aquí se valida cada
# acción y se registra una traza que el navegador anima. Lo usan el worker y el verificador.
import json

MAX_ACCIONES = 1000
DIRS = "NESW"  # norte, este, sur, oeste (sentido horario)
DELTA = {"N": (0, -1), "E": (1, 0), "S": (0, 1), "W": (-1, 0)}


class Choque(Exception):
    """Error del juego (chocar, comer donde no hay…): se muestra al jugador en español."""


class Laberinto:
    def __init__(self, filas, direccion):
        self.filas = filas
        self.manzanas = set()
        self.meta = None
        for y, fila in enumerate(filas):
            for x, c in enumerate(fila):
                if c == "S":
                    self.x, self.y = x, y
                elif c == "A":
                    self.manzanas.add((x, y))
                elif c == "G":
                    self.meta = (x, y)
        self.d = direccion
        self.total_manzanas = len(self.manzanas)
        self.traza = [[self.x, self.y, self.d, "inicio"]]

    def _anotar(self, evento):
        if len(self.traza) > MAX_ACCIONES:
            raise Choque("Demasiadas acciones (más de 1,000): ¿hay un bucle infinito?")
        self.traza.append([self.x, self.y, self.d, evento])

    def _libre(self, x, y):
        return 0 <= y < len(self.filas) and 0 <= x < len(self.filas[y]) and self.filas[y][x] != "#"

    def _vecina(self, giro):
        d = DIRS[(DIRS.index(self.d) + giro) % 4]
        dx, dy = DELTA[d]
        return self.x + dx, self.y + dy

    # --- API para el jugador ---
    def avanzar(self):
        nx, ny = self._vecina(0)
        if not self._libre(nx, ny):
            self._anotar("choque")
            raise Choque("¡La serpiente chocó con un muro!")
        self.x, self.y = nx, ny
        self._anotar("avanzar")

    def girar_izquierda(self):
        self.d = DIRS[(DIRS.index(self.d) - 1) % 4]
        self._anotar("girar")

    def girar_derecha(self):
        self.d = DIRS[(DIRS.index(self.d) + 1) % 4]
        self._anotar("girar")

    def comer(self):
        if (self.x, self.y) not in self.manzanas:
            self._anotar("sin_manzana")
            raise Choque("Aquí no hay ninguna manzana para comer.")
        self.manzanas.discard((self.x, self.y))
        self._anotar("comer")

    def libre_adelante(self):
        return self._libre(*self._vecina(0))

    def libre_izquierda(self):
        return self._libre(*self._vecina(-1))

    def libre_derecha(self):
        return self._libre(*self._vecina(1))

    def hay_manzana(self):
        return (self.x, self.y) in self.manzanas

    def en_meta(self):
        return (self.x, self.y) == self.meta

    def manzanas_restantes(self):
        return len(self.manzanas)

    def api(self):
        nombres = [
            "avanzar", "girar_izquierda", "girar_derecha", "comer", "libre_adelante",
            "libre_izquierda", "libre_derecha", "hay_manzana", "en_meta", "manzanas_restantes",
        ]
        self.llamadas = 0

        # Cuenta también las preguntas: así se corta `while not en_meta(): pass`.
        def contar(f):
            def g():
                self.llamadas += 1
                if self.llamadas > MAX_ACCIONES * 5:
                    raise Choque("Tu programa no termina: ¿hay un bucle infinito?")
                return f()
            g.__name__ = f.__name__
            return g

        return {n: contar(getattr(self, n)) for n in nombres}

    def resultado(self):
        faltan = len(self.manzanas)
        en_meta = self.meta is None or (self.x, self.y) == self.meta
        if faltan and not en_meta:
            falla = f"Faltan {faltan} {'manzana' if faltan == 1 else 'manzanas'} y la serpiente no llegó a la meta."
        elif faltan:
            falla = f"Faltan {faltan} {'manzana' if faltan == 1 else 'manzanas'} por comer."
        elif not en_meta:
            falla = "La serpiente no terminó en la meta."
        else:
            falla = None
        return falla


def _usa(src, tipos):
    import ast
    try:
        return any(type(n).__name__ in tipos for n in ast.walk(ast.parse(src)))
    except SyntaxError:
        return True  # el error de sintaxis se reporta al ejecutar


def correr_laberinto(src, mapas_json, max_lineas=0, requiere_json="[]"):
    """Ejecuta src en cada mapa. Devuelve JSON con la traza y el resultado de cada uno."""
    import io
    import sys

    mapas = json.loads(mapas_json)
    requiere = json.loads(requiere_json)
    lineas = [l for l in src.split("\n") if l.strip() and not l.strip().startswith("#")]
    salida = []
    for m in mapas:
        lab = Laberinto(m["filas"], m.get("dir", "E"))
        ns = {"__name__": "__main__", **lab.api()}
        buf = io.StringIO()
        old = sys.stdout
        sys.stdout = buf
        error = None
        linea = None
        try:
            exec(compile(src, "<tu código>", "exec"), ns)
        except Choque as e:
            error = str(e)
        except BaseException as e:  # errores de Python del jugador
            error = f"{type(e).__name__}: {e}"
            tb = e.__traceback__
            while tb:
                if tb.tb_frame.f_code.co_filename == "<tu código>":
                    linea = tb.tb_lineno
                tb = tb.tb_next
            if isinstance(e, SyntaxError):
                linea = e.lineno
        finally:
            sys.stdout = old
        falla = error or lab.resultado()
        esperado = m.get("out")
        if not falla and esperado is not None and buf.getvalue().strip() != esperado:
            mostrado = buf.getvalue().strip() or "nada"
            falla = f"Mostraste {mostrado}, pero debía ser {esperado}."
        salida.append({
            "ok": falla is None,
            "falla": falla,
            "error": error is not None,
            "linea": linea,
            "traza": lab.traza,
            "comidas": lab.total_manzanas - len(lab.manzanas),
            "total": lab.total_manzanas,
            "out": buf.getvalue(),
        })
    return json.dumps({
        "mapas": salida,
        "lineas": len(lineas),
        "demasiadas_lineas": bool(max_lineas) and len(lineas) > max_lineas,
        "falta_funcion": bool(requiere) and not _usa(src, requiere),
    }, ensure_ascii=False)
