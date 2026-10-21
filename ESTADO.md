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

## App de Android (1.2.0, 2026-10-18)

- `node tools/build-apk.mjs` → `dist/PythonGO-<versión>.apk` (~10.7 MB, Android 7+), con Python incluido.
- Proyecto Capacitor 8 en `apk/`; Java 21 portátil en `~/.jdks/`; SDK en `C:\Android\Sdk`.
- **Llave de firma en `apk/keys/` (fuera de git): respaldarla.** Sin ella no se puede actualizar el APK instalado.
- Falta: probar el APK en un celular real.

## Versión 1.2.1 (2026-10-21) — sin publicar

- **Convivencia con otras apps del mismo origen.** `dponch-00.github.io` también sirve MKompact y comparte
  CacheStorage y service workers. Antes, al activarse, el SW borraba *todas* las cachés del origen y
  «Reparar la app» quitaba *todos* los service workers del origen: dejaba sin modo offline a MKompact (y
  MKompact v8 hacía lo mismo con Python GO). Ahora el SW solo borra cachés `pygo-` de versiones anteriores
  (conserva `pygo-runtime`) y «Reparar la app» solo quita el SW con alcance `/python-go/` y las cachés `pygo-`.
- Probado en local con Chrome headless (ambas apps en `localhost:8792/python-go/` y `/Mkompact/`): se
  reprodujo el fallo con 1.2.0 + MKompact v8, y con 1.2.1 + MKompact v9 la caché de la otra app y una caché
  ajena (`ais-test`) sobreviven a activaciones, «Reparar la app» y «Reinstalar limpio»; las dos abren sin conexión.
- Falta: publicar (push a `main`). Conviene publicar a la vez MKompact v9. El APK no cambia (no usa el SW).

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
