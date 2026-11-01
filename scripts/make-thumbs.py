"""Writes a small <name>.thumb.webp next to every screenshot in public/screens.

Product cards and the gallery strip load these instead of the full-size screenshots,
which keeps the catalogue pages light. Re-run after adding or replacing screenshots:
    python3 -I scripts/make-thumbs.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "screens"
WIDTH = 520

for src in sorted(ROOT.glob("*/*.webp")):
    if src.name.endswith(".thumb.webp"):
        continue
    out = src.with_name(src.stem + ".thumb.webp")
    with Image.open(src) as im:
        if im.width > WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        im.save(out, "WEBP", quality=72, method=6)
