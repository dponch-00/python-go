# Python GO — estado del proyecto

Juego de acertijos por niveles para aprender Python. PWA estática (HTML/CSS/JS sin frameworks)
para **GitHub Pages**; se instala en el celular, funciona sin conexión y ejecuta Python real con
**Pyodide 314.0.7** (CPython 3.14) en un Web Worker que solo se descarga al abrir un laboratorio o la consola.

## Versión 1.0.0 — completa (2026-09-29)

- 100 niveles en 10 mundos con 6 tipos de acertijo (17 laboratorios de código real).
- Contrarreloj, Reto diario, Repaso espaciado, Consola libre.
- Puntos, estrellas, combos, XP y rangos, racha con protector, meta diaria, 26 logros, tienda con temas.
- Varios jugadores por dispositivo, ranking local, copia de seguridad (código o archivo).
- Tema claro/oscuro, diseño para celular y PC, instalable, sin conexión y con aviso de nueva versión.

## Verificación

| Prueba | Comando | Resultado |
|---|---|---|
| Niveles contra CPython (respuestas, ambigüedades, laboratorios) | `python tools/verify_levels.py` | 100/100 |
| Generador del Contrarreloj contra CPython | `node tools/verify-arcade.mjs` | 4980/4980 |
| Los 100 niveles jugados desde la interfaz (laboratorios con Pyodide) | `tools/prueba-navegador.js` | 100/100 |

También se probó en el navegador: errores de Python explicados en español con la línea marcada,
bucle infinito cortado a los 8 s sin congelar la app, Contrarreloj y Reto diario completos,
precarga sin conexión (Pyodide y tipografías en caché) y el ciclo de actualización del service worker.

## Publicado

- Repo: https://github.com/dponch-00/python-go (rama `main`, GitHub Pages desde `/ (root)`).
- Juego: https://dponch-00.github.io/python-go/ — comprobado el 2026-09-29: carga, service worker activo
  y Python 3.14 ejecutándose desde el sitio publicado.
- Para publicar cambios: `node tools/update-sw.mjs`, commit y push (Pages se actualiza en 1–2 minutos).

## Pendiente

- Probarlo instalado en un celular real (Android/iPhone).
- Ideas futuras: ranking global en línea (requiere un servicio como Supabase o Firebase), más mundos
  (archivos, módulos, `collections`, pruebas con `assert`), modo para dos jugadores.
