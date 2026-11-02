"""Writes a small <name>.thumb.webp next to every screenshot in public/screens.

Product cards and the gallery strip load these instead of the full-size screenshots,
which keeps the catalogue pages light. It also stamps each screenshot in data/screens*.json with a short content hash (`v`),
which the site adds to image URLs so a replaced screenshot is never served from cache.
Re-run after adding or replacing screenshots:
    python3 -I scripts/make-thumbs.py
"""
import hashlib
import json
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

PUBLIC = ROOT.parent
DATA = PUBLIC.parent / "data"


def stamp(entries):
    for e in entries:
        f = PUBLIC / e["src"].lstrip("/")
        if f.exists():
            e["v"] = hashlib.sha1(f.read_bytes()).hexdigest()[:8]


index = json.loads((DATA / "screens.json").read_text())
for entries in index.values():
    stamp(entries)
(DATA / "screens.json").write_text(json.dumps(index))
for f in sorted((DATA / "screens").glob("*.json")):
    entries = json.loads(f.read_text())
    stamp(entries)
    f.write_text(json.dumps(entries, indent=1))
