"""Servidor local para jugar y desarrollar Python GO.

Uso: python tools/serve.py [puerto]     (por defecto 8765)
Pide al navegador que revalide cada archivo, así siempre ves la versión actual.
"""
import http.server
import socketserver
import sys
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".webmanifest": "application/manifest+json",
        ".wasm": "application/wasm",
        ".webp": "image/webp",
        ".woff2": "font/woff2",
        ".py": "text/plain; charset=utf-8",
    }

    def end_headers(self):
        # --pages imita a GitHub Pages (cada archivo se guarda 10 minutos en la caché del navegador).
        self.send_header("Cache-Control", "max-age=600" if PAGES else "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # silencioso


PAGES = "--pages" in sys.argv

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    port = int(args[0]) if args else 8765
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT))) as httpd:
        print(f"Python GO en http://localhost:{port}  (Ctrl+C para detener)")
        httpd.serve_forever()
