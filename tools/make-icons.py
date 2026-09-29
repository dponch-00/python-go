"""Genera los íconos PNG de la app con la misma geometría que icons/icon.svg.

Uso: python tools/make-icons.py   (requiere Pillow)
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
SS = 4  # sobremuestreo para bordes suaves

NAVY = (15, 27, 45, 255)
GOLD = (255, 201, 51, 255)
GOLD_DEEP = (217, 163, 0, 255)
WHITE = (255, 255, 255, 255)
INK = (29, 21, 0, 255)
RED = (229, 72, 77, 255)

# Cuerpo: tres curvas de Bézier cúbicas (igual que el path del SVG).
BODY = [
    ((384, 408), (270, 424), (142, 398), (146, 322)),
    ((146, 322), (150, 248), (360, 270), (364, 196)),
    ((364, 196), (367, 144), (322, 118), (262, 122)),
]


def bezier(p0, p1, p2, p3, n=400):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def render(size, maskable=False):
    W = 512 * SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if maskable:
        d.rectangle([0, 0, W, W], fill=NAVY)
        tf = lambda p: (((p[0] - 256) * 0.74 + 256) * SS, ((p[1] - 256) * 0.74 + 262) * SS)
        k = 0.74 * SS
    else:
        d.rounded_rectangle([0, 0, W - 1, W - 1], radius=112 * SS, fill=NAVY)
        tf = lambda p: (p[0] * SS, p[1] * SS)
        k = SS

    def disc(c, r, fill):
        x, y = tf(c)
        d.ellipse([x - r * k, y - r * k, x + r * k, y + r * k], fill=fill)

    def ellipse(c, rx, ry, fill):
        x, y = tf(c)
        d.ellipse([x - rx * k, y - ry * k, x + rx * k, y + ry * k], fill=fill)

    def stroke(points, width, fill):
        # Discos solapados a lo largo del trazo: evita las rayas de line(width=…) en Pillow.
        prev = points[0]
        disc(prev, width / 2, fill)
        for p in points[1:]:
            steps = max(1, int(math.dist(p, prev) / 0.75))
            for s in range(1, steps + 1):
                t = s / steps
                disc((prev[0] + (p[0] - prev[0]) * t, prev[1] + (p[1] - prev[1]) * t), width / 2, fill)
            prev = p

    path = []
    for seg in BODY:
        path.extend(bezier(*seg))
    stroke(path, 62, GOLD)

    # Escamas: puntos cada 36 unidades a lo largo del cuerpo.
    acc, last = 0.0, path[0]
    disc(last, 7, GOLD_DEEP)
    for p in path[1:]:
        acc += math.dist(p, last)
        last = p
        if acc >= 36:
            acc = 0
            disc(p, 7, GOLD_DEEP)

    disc((226, 132), 66, GOLD)
    ellipse((202, 112), 17, 20, WHITE)
    ellipse((248, 112), 17, 20, WHITE)
    ellipse((206, 117), 8.5, 11.5, NAVY)
    ellipse((252, 117), 8.5, 11.5, NAVY)
    stroke(bezier((196, 160), (206, 168), (230, 168), (240, 160), 60), 7, INK)
    stroke([(164, 150), (126, 164)], 9, RED)
    stroke([(126, 164), (106, 152)], 9, RED)
    stroke([(126, 164), (112, 182)], 9, RED)

    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    render(512).save(OUT / "icon-512.png", optimize=True)
    render(192).save(OUT / "icon-192.png", optimize=True)
    render(180).save(OUT / "apple-touch-icon.png", optimize=True)
    render(512, maskable=True).save(OUT / "maskable-512.png", optimize=True)
    render(64).save(OUT / "favicon-64.png", optimize=True)
    print("Íconos generados en", OUT)
