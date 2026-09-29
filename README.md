# Python GO

Juego de acertijos por niveles para aprender Python, en el celular o en la PC.
Es una app web instalable (PWA): funciona sin conexión y ejecuta **Python real** (CPython 3.14
con [Pyodide](https://pyodide.org)) directamente en tu dispositivo, sin servidor.

## Qué trae

- **100 niveles en 10 mundos**, de `print()` a clases, decoradores y excepciones.
- **6 tipos de acertijo:** ¿Qué imprime?, Escribe la salida, Completa el hueco, Ordena el código,
  Caza el error y Laboratorio (escribes código de verdad y se prueba con varios casos).
- **Puntos y estrellas:** 1–3 estrellas por nivel, bonos por precisión, rapidez y combos de niveles perfectos.
- **Progreso:** XP y niveles de jugador con rangos, racha diaria con protector, meta diaria y 26 logros.
- **Vidas sin castigo:** 3 vidas por intento; si las pierdes, reintentas al momento (no hay esperas ni pagos).
- **Repaso inteligente:** lo que fallas vuelve a los 1, 3 y 7 días.
- **Contrarreloj:** 60 segundos con preguntas generadas sin fin, cada vez más difíciles.
- **Reto diario:** 8 preguntas, las mismas para todos ese día.
- **Consola libre** para experimentar, con errores explicados en español.
- **Varios jugadores** en el mismo dispositivo, ranking entre ellos y copia de seguridad para mover el progreso.
- Tema claro/oscuro, 4 temas de código, sonidos y vibración.

## Jugar

- **En la PC:** doble clic en `Iniciar Python GO.bat` (usa Python para abrir un servidor local en
  `http://localhost:8765`).
- **En el celular:** abre la dirección publicada en GitHub Pages y elige *Agregar a pantalla de inicio*
  (en Android, Chrome ofrece *Instalar app*). La primera vez que entres a un laboratorio se descarga
  Python (~13 MB); después funciona sin conexión.

## Publicar en GitHub Pages

1. Antes de publicar cambios: `node tools/update-sw.mjs` (actualiza la lista de archivos sin conexión
   y la versión de caché; así los celulares reciben el aviso de «Nueva versión»).
2. Sube el repositorio a GitHub.
3. En GitHub: *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*.

## Cómo agregar niveles

Los niveles viven en `js/data/levels-1.js` (mundos 1–5) y `js/data/levels-2.js` (mundos 6–10).
Cada nivel es un objeto con un `id` único que **no debe cambiar** (el progreso se guarda por id).

Campos comunes: `id`, `t` (tipo), `title`, `q` (pregunta), `hint` (pista), `why` (explicación),
`learn` (tarjeta de concepto, opcional) y `boss: true` para el jefe del mundo.
En los textos puedes usar `` `código` ``, `**negrita**` y `*cursiva*`.

| Tipo | Campos |
|---|---|
| `choice` | `code`, `opts` (lista de salidas), `a` (índice correcto). `"(error)"` = «Da un error». `noRun: true` si no es una salida. |
| `input` | `code`, `a` (salida exacta), `alt` (otras formas aceptadas, opcional) |
| `fill` | `code` con `___` en cada hueco, `blanks` (respuestas aceptadas por hueco), `bank` (piezas), `goal` (salida) |
| `order` | `lines` (en el orden correcto), `head` (líneas fijas al inicio, opcional), `goal` |
| `bug` | `code` (con el error), `line` (número de la línea mala), `fix` (código corregido), `goal` |
| `code` | `starter`, `sol`, `goal` (texto), `pre` (variables dadas, opcional), `tests` |

Pruebas de un laboratorio (`tests`): `{ out: "salida" }`, `{ ex: "f(2)", eq: "4" }` (compara `repr`),
`{ check: "expresión booleana" }` (puede usar `salida`), `{ run: "código con assert" }`,
`{ uses: ["For", "While"] }` (exige esa construcción), `{ noCall: "max" }` (prohíbe una función).
Cualquier prueba puede llevar su propio `pre` para probar con otros datos.

**Después de editar, verifica siempre:**

```bash
python tools/verify_levels.py
```

Ejecuta cada nivel en CPython y detecta respuestas incorrectas, huecos o distractores ambiguos,
órdenes alternativos válidos, líneas de error mal marcadas y laboratorios cuya solución no pasa.
Para el generador del Contrarreloj: `node tools/verify-arcade.mjs`.

## Estructura

```
index.html, manifest.webmanifest, sw.js   app y modo sin conexión
css/app.css                                estilos (tokens de color claro/oscuro y temas de código)
js/main.js                                 navegación, barra superior, pestañas
js/data/                                   mundos y niveles
js/engine/                                 puntuación, progreso, guardado, generador, Python (worker + arnés)
js/ui/                                     editor, resaltado, iconos, sonidos y pantallas
tools/                                     verificadores, íconos y lista del service worker
```
