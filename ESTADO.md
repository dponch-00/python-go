# Python GO — estado del proyecto

Juego de acertijos por niveles para aprender Python. PWA estática (HTML/CSS/JS sin frameworks)
publicada en **GitHub Pages**; se instala en el celular, funciona sin conexión y ejecuta Python real con
**Pyodide 314.0.7** (CPython 3.14) en un Web Worker que solo se descarga al abrir un laboratorio,
un laberinto o la consola.

- Repo: https://github.com/dponch-00/python-go (rama `main`, Pages desde `/ (root)`)
- Juego: https://dponch-00.github.io/python-go/

## Versión 1.1.0 (2026-09-29)

- **177 niveles en 3 rutas:** Fundamentos (100), Laberintos de la serpiente (17) y Algoritmos (60).
- **Laberintos:** tablero animado en canvas; el simulador (`js/engine/maze.py`) corre el código del
  jugador en Python y devuelve una traza que se anima. Cada nivel se prueba en varios mapas.
- **Interfaz 1.1:** íconos 3D Fluent Emoji (MIT), tipografías locales, editor CodeMirror 6 con
  autocompletado (empaquetado en `js/vendor/`), transiciones entre pantallas y pestañas de rutas en el mapa.
- Contrarreloj, Reto diario, Repaso espaciado, Consola, 28 logros, tienda, varios jugadores, copia de seguridad.

## Verificación

| Prueba | Comando | Resultado |
|---|---|---|
| Niveles contra CPython (respuestas, ambigüedades, laboratorios, laberintos) | `python tools/verify_levels.py` | 177/177 |
| Generador del Contrarreloj contra CPython | `node tools/verify-arcade.mjs` | 4980/4980 |
| Todos los niveles jugados desde la interfaz con Pyodide | `tools/prueba-navegador.js` | 177/177 |

## Pendiente / ideas

- Probar la versión 1.1 instalada en un celular real.
- Ranking global en línea (requiere un servicio como Supabase o Firebase).
- Más contenido: módulos (`random`, `datetime`, `collections`), archivos, más laberintos (sensores de
  manzana cercana, laberintos con ciclos que requieren memoria de casillas visitadas).
- Ejecución paso a paso que muestre las variables (tipo Python Tutor).
