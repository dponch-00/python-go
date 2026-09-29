"""Descarga los íconos 3D de Fluent Emoji (Microsoft, licencia MIT) y los guarda como WebP.

Uso: python tools/get-emoji.py      (requiere internet y Pillow)
Fuente: https://github.com/microsoft/fluentui-emoji
"""
import io
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "img" / "e"
SIZE = 160

# clave → nombre de la carpeta en el repositorio de Fluent Emoji
WANT = {
    # interfaz
    "fire": "Fire", "gem": "Gem stone", "heart": "Red heart", "star": "Star", "glow": "Glowing star",
    "trophy": "Trophy", "crown": "Crown", "bulb": "Light bulb", "stopwatch": "Stopwatch",
    "calendar": "Spiral calendar", "repeat": "Counterclockwise arrows button", "target": "Bullseye",
    "shield": "Shield", "brain": "Brain", "moon": "Crescent moon", "sunrise": "Sunrise",
    "party": "Party popper", "sparkles": "Sparkles", "rocket": "Rocket", "laptop": "Laptop",
    "flag": "Chequered flag", "lock": "Locked", "medal1": "1st place medal",
    "medal2": "2nd place medal", "medal3": "3rd place medal", "books": "Books", "grad": "Graduation cap",
    "puzzle": "Puzzle piece", "zap": "High voltage", "hourglass": "Hourglass not done",
    "keyboard": "Keyboard", "search": "Magnifying glass tilted left", "check": "Check mark button",
    "map": "World map", "joystick": "Joystick", "bag": "Shopping bags",
    "snowflake": "Snowflake", "palette": "Artist palette", "chart": "Bar chart", "apple": "Red apple",
    "brick": "Brick", "hundred": "Hundred points",
    "muscle": "Flexed biceps", "memo": "Memo", "gear": "Gear", "sun": "Sun", "key": "Old key", "abacus": "Abacus", "compass": "Compass",
    "dolls": "Nesting dolls", # mundos
    "w1": "Desert island", "w2": "Evergreen tree", "w3": "Scroll", "w4": "National park",
    "w5": "Snow-capped mountain", "w6": "Shopping cart", "w7": "Classical building", "w8": "Factory",
    "w9": "Test tube", "w10": "Castle",
    # avatares
    "a-snake": "Snake", "a-fox": "Fox", "a-panda": "Panda", "a-frog": "Frog", "a-owl": "Owl",
    "a-octopus": "Octopus", "a-unicorn": "Unicorn", "a-tiger": "Tiger face", "a-penguin": "Penguin",
    "a-turtle": "Turtle", "a-trex": "T-Rex", "a-bee": "Honeybee", "a-cat": "Cat face", "a-dog": "Dog face",
    "a-rabbit": "Rabbit face", "a-lion": "Lion", "a-koala": "Koala", "a-monkey": "Monkey face",
    "a-robot": "Robot", "a-alien": "Alien", "a-ghost": "Ghost", "a-dragon": "Dragon",
    "a-chick": "Hatching chick", "a-parrot": "Parrot",
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tree = json.load(urllib.request.urlopen("https://api.github.com/repos/microsoft/fluentui-emoji/git/trees/main?recursive=1"))
    paths = [e["path"] for e in tree["tree"] if e["path"].endswith(".png") and "/3D/" in e["path"]]
    by_folder = {}
    for p in paths:
        folder = p.split("/")[1].lower()
        # Si hay tonos de piel, preferir el predeterminado.
        if folder not in by_folder or "/Default/" in p:
            by_folder[folder] = p
    missing, total = [], 0
    for key, name in WANT.items():
        path = by_folder.get(name.lower())
        if not path:
            missing.append(name)
            continue
        dest = OUT / f"{key}.webp"
        if dest.exists():
            continue
        url = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/" + urllib.parse.quote(path)
        img = Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert("RGBA")
        img.thumbnail((SIZE, SIZE), Image.LANCZOS)
        img.save(dest, "WEBP", quality=88, method=6)
        total += dest.stat().st_size
        print(f"  {key:<11} ← {name}")
    print(f"Listo. Nuevos: {total // 1024} KB. Faltan: {missing or 'ninguno'}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
