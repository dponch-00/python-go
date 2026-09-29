# Python GO

Juego de acertijos por niveles para aprender Python, en el celular o en la PC.
Es una app web instalable (PWA): funciona sin conexión y ejecuta **Python real** (CPython 3.14
con [Pyodide](https://pyodide.org)) directamente en tu dispositivo, sin servidor.

**Jugar:** https://dponch-00.github.io/python-go/

## Qué trae

**177 niveles en tres rutas:**

| Ruta | Mundos | Qué enseña |
|---|---|---|
| **Fundamentos** | 10 mundos · 100 niveles | De `print()` a clases, decoradores y excepciones |
| **Laberintos** | 2 mundos · 17 niveles | Programas a la serpiente con `avanzar()`, bucles, condiciones y funciones; termina con la regla de la mano derecha |
| **Algoritmos** | 6 mundos · 60 niveles | Matemáticas, dos punteros, cifrados y pilas, búsqueda binaria y ordenamientos, recursión y backtracking, programación dinámica y BFS |

- **7 tipos de acertijo:** ¿Qué imprime?, Escribe la salida, Completa el hueco, Ordena el código,
  Caza el error, Laboratorio (escribes código y se prueba con varios casos) y Laberinto (animado).
- **Puntos y estrellas:** 1–3 estrellas por nivel, bonos por precisión, rapidez y combos.
- **Progreso:** XP y rangos, racha diaria con protector, meta diaria y 28 logros.
- **Vidas sin castigo:** si las pierdes, reintentas al momento (sin esperas ni pagos).
- **Repaso inteligente:** lo que fallas vuelve a los 1, 3 y 7 días.
- **Contrarreloj** (preguntas generadas sin fin) y **Reto diario** (las mismas 8 para todos).
- **Consola libre** con editor profesional (autocompletado) y errores explicados en español.
- **Varios jugadores** por dispositivo, ranking entre ellos y copia de seguridad.
- Tema claro/oscuro, 4 temas de código, íconos 3D, sonidos y vibración.

## Jugar en la PC

Doble clic en `Iniciar Python GO.bat` (abre `http://localhost:8765` con `tools/serve.py`).

## Publicar cambios

1. `node tools/update-sw.mjs` — actualiza la lista de archivos sin conexión y la versión de caché
   (así los celulares reciben el aviso de «Nueva versión»).
2. Commit y push a `main`. GitHub Pages se actualiza en 1–2 minutos.

## Cómo agregar niveles

Los niveles viven en `js/data/`: `levels-1.js` y `levels-2.js` (Fundamentos), `mazes.js` (Laberintos)
y `algo.js` (Algoritmos). Cada nivel tiene un `id` único que **no debe cambiar** (el progreso se guarda por id).

Campos comunes: `id`, `t` (tipo), `title`, `q` (pregunta), `hint`, `why` (explicación),
`learn` (tarjeta de concepto, opcional) y `boss: true` para el jefe del mundo.
En los textos puedes usar `` `código` ``, `**negrita**` y `*cursiva*`.

| Tipo | Campos |
|---|---|
| `choice` | `code`, `opts` (lista de salidas), `a` (índice correcto). `"(error)"` = «Da un error». `noRun: true` si no es una salida. |
| `input` | `code`, `a` (salida exacta), `alt` (otras formas aceptadas, opcional) |
| `fill` | `code` con `___` en cada hueco, `blanks` (respuestas aceptadas por hueco), `bank` (piezas), `goal` |
| `order` | `lines` (en el orden correcto, máximo 9), `head` / `tail` (líneas fijas antes/después), `goal` |
| `bug` | `code` (con el error), `line` (número de la línea mala), `fix` (código corregido), `goal` |
| `code` | `starter`, `sol`, `goal` (texto), `pre` (variables dadas, opcional), `tests` |
| `maze` | `maps` (lista de `{ filas, dir, out? }`), `api` (órdenes que se muestran), `starter`, `sol`, `maxLines?`, `need?` |

**Pruebas de un laboratorio** (`tests`): `{ out }` (salida), `{ ex, eq }` (compara `repr`),
`{ check }` (expresión booleana; puede usar `salida`), `{ run }` (código con `assert`),
`{ uses: [...] }` (exige una construcción), `{ bans: [...] }` (la prohíbe), `{ noCall }`, `{ noAttr }`
(p. ej. `"sort"`), `{ noImport }` y `{ recursive: "funcion" }`. Cualquier prueba puede llevar su `pre`.

**Mapas de laberinto:** `#` muro, `.` pasto, `S` serpiente, `A` manzana, `G` meta; `dir` es hacia
dónde mira al empezar (`N`, `E`, `S`, `W`). Usa varios mapas para que la solución tenga que ser general.
Órdenes: `avanzar()`, `girar_izquierda()`, `girar_derecha()`, `comer()`, `libre_adelante()`,
`libre_izquierda()`, `libre_derecha()`, `hay_manzana()`, `en_meta()`, `manzanas_restantes()`.

**Después de editar, verifica siempre:**

```bash
python tools/verify_levels.py
```

Ejecuta cada nivel en CPython: detecta respuestas incorrectas, distractores ambiguos, órdenes
alternativos válidos, líneas de error mal marcadas, laboratorios y laberintos cuya solución no pasa,
y códigos iniciales que ya resuelven el reto. Para el Contrarreloj: `node tools/verify-arcade.mjs`.
Para jugar todos los niveles desde la interfaz, con el juego abierto en `localhost`:
`(await import("/tools/prueba-navegador.js")).correr()` en la consola del navegador (usa un jugador de prueba).

## Herramientas

| Comando | Para qué |
|---|---|
| `npm install` y `node tools/build-editor.mjs` | Reempaqueta el editor CodeMirror en `js/vendor/` |
| `python tools/get-emoji.py` | Descarga los íconos 3D (lista `WANT`) |
| `python tools/make-icons.py` | Genera los íconos de la app |
| `python tools/serve.py` | Servidor local que siempre entrega la versión actual |

## Estructura

```
index.html, manifest.webmanifest, sw.js   app y modo sin conexión
css/                                       estilos y tipografías
fonts/, img/e/, icons/                     tipografías, íconos 3D e íconos de la app
js/main.js                                 navegación, barra superior, pestañas
js/data/                                   rutas, mundos y niveles
js/engine/                                 puntuación, progreso, guardado, generador, Python (worker, arnés, laberinto)
js/ui/                                     editores, resaltado, tablero del laberinto, sonidos y pantallas
js/vendor/                                 CodeMirror empaquetado
tools/                                     verificadores, pruebas y generadores
```

## Créditos

- [Pyodide](https://pyodide.org) (MPL 2.0) — Python en el navegador.
- [CodeMirror 6](https://codemirror.net) (MIT) — editor de código.
- [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft (MIT) — íconos 3D.
- Tipografías Unbounded, Figtree y JetBrains Mono (SIL Open Font License).
