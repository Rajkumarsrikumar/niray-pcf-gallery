"""Extract screenshots from a component package (.tgz), pick the best ones, add a Niray watermark
and write public/screens/<slug>/NN.webp plus data/screens/<slug>.json.

Usage: python3 -I scripts/watermark-screens.py <package.tgz> [<package.tgz> ...]
"""
import io, json, os, re, sys, tarfile
from PIL import Image, ImageDraw, ImageFont, ImageStat

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MARK = Image.open(os.path.join(ROOT, "public", "brand", "nmark.png")).convert("RGBA")
FONT = next(p for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf") if os.path.exists(p))
MAX_SHOTS = 6
MIN_W, MIN_H = 300, 200
MAX_NEAR_WHITE = 0.97
MIN_STDDEV = 6
SKIP = re.compile(r"(output|log|harness|panel-outputs|invalid|error|empty|disabled|readonly|read-only|loading|blank|placeholder)", re.I)

SLUGS = {c["component"]: c["slug"] for c in json.load(open(os.path.join(ROOT, "data", "components.json")))}

def slugify(name):
    return SLUGS.get(name) or re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", name).lower()

def rank(name):
    n = name.lower()
    score = 0
    if "default" in n or n.startswith("01"): score -= 50
    if "1366" in n or "desktop" in n: score -= 20
    if "375" in n or "mobile" in n: score -= 10
    if "disabled" in n or "empty" in n or "readonly" in n or "read-only" in n: score += 30
    if "320" in n or "360" in n: score += 15
    return (score, n)

def is_harness(img):
    """Full-window shots of the PCF test harness: purple title bar and a properties panel on the right."""
    if img.width < 1200:
        return False
    r, g, b = img.convert("RGB").getpixel((5, 5))[:3]
    return r > 90 and b > 90 and g < 80

def crop_harness(img):
    img = img.convert("RGB").crop((0, 46, min(1012, img.width), img.height))
    # trim empty rows at the bottom
    px = img.load()
    bottom = img.height
    while bottom > 200 and all(sum(px[x, bottom - 1]) > 735 for x in range(0, img.width, 7)):
        bottom -= 1
    return img.crop((0, 0, img.width, min(img.height, bottom + 16)))

def is_decent(img):
    """Rejects tiny shots and ones that are nearly blank."""
    if img.width < MIN_W or img.height < MIN_H:
        return False
    grey = img.convert("L")
    near_white = sum(grey.histogram()[243:]) / (grey.width * grey.height)
    return near_white <= MAX_NEAR_WHITE and ImageStat.Stat(grey).stddev[0] >= MIN_STDDEV

def pick(candidates):
    """Best desktop shot first, capped at MAX_SHOTS, keeping at least one mobile shot when there is one."""
    first_desktop = next((c for c in candidates if not c["mobile"]), None)
    if first_desktop:
        candidates = [first_desktop] + [c for c in candidates if c is not first_desktop]
    chosen = candidates[:MAX_SHOTS]
    if not any(c["mobile"] for c in chosen):
        mobile = next((c for c in candidates if c["mobile"]), None)
        if mobile:
            chosen[-1] = mobile
    return chosen

def clean_caption(base):
    t = re.sub(r"^\d+[-_ ]*", "", base)
    t = re.sub(r"(desktop|mobile|phone|tablet|crop(ped)?|full|\d{3,4}(px)?|w\d+)", " ", t, flags=re.I)
    t = re.sub(r"[-_ ]+", " ", t).strip()
    return (t[:1].upper() + t[1:]) if t else "Overview"

def watermark(img):
    img = img.convert("RGBA")
    w, h = img.size
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # faint diagonal tiled text
    tile_font = ImageFont.truetype(FONT, max(14, w // 60))
    txt = "NIRAY PCF GALLERY"
    tile = Image.new("RGBA", (int(w * 0.5), int(w * 0.12)), (0, 0, 0, 0))
    ImageDraw.Draw(tile).text((0, 0), txt, font=tile_font, fill=(0, 59, 92, 22))
    tile = tile.rotate(24, expand=True)
    for y in range(-tile.height, h + tile.height, int(tile.height * 0.9)):
        for x in range(-tile.width, w + tile.width, int(tile.width * 0.9)):
            off = (tile.width // 2) if (y // max(1, int(tile.height * 0.9))) % 2 else 0
            layer.alpha_composite(tile, (x + off, y))
    # corner badge
    mh = max(18, w // 40)
    mark = MARK.resize((int(MARK.width * mh / MARK.height), mh), Image.LANCZOS)
    f = ImageFont.truetype(FONT, int(mh * 0.62))
    label = "Niray PCF Gallery"
    tw = d.textlength(label, font=f)
    pad = int(mh * 0.45)
    bw, bh = int(mark.width + tw + pad * 3), mh + pad * 2
    bx, by = w - bw - pad, h - bh - pad
    d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=bh // 2, fill=(255, 255, 255, 200))
    layer.alpha_composite(mark, (bx + pad, by + pad))
    d.text((bx + pad * 2 + mark.width, by + pad + mh * 0.12), label, font=f, fill=(0, 59, 92, 235))
    return Image.alpha_composite(img, layer).convert("RGB")

def process(tgz):
    with tarfile.open(tgz) as tf:
        shots = [m for m in tf.getmembers() if m.isfile() and "/docs/screenshots/" in m.name and m.name.lower().endswith(".png") and not SKIP.search(os.path.basename(m.name))]
        if not shots:
            print("no screenshots in", tgz); return None
        comp = shots[0].name.split("/")[0].split("_")[0]
        slug = slugify(comp)
        ordered = sorted(shots, key=lambda m: rank(os.path.basename(m.name)))
        candidates, seen = [], set()
        for m in ordered:
            try:
                img = Image.open(io.BytesIO(tf.extractfile(m).read()))
                img.load()
            except (OSError, ValueError):
                continue
            if is_harness(img):
                img = crop_harness(img)
            if not is_decent(img):
                continue
            caption = clean_caption(os.path.splitext(os.path.basename(m.name))[0])
            mobile = img.width < 500
            key = (caption.lower(), mobile)
            if key in seen:
                continue
            seen.add(key)
            candidates.append({"img": img, "caption": caption, "mobile": mobile})
        outdir = os.path.join(ROOT, "public", "screens", slug)
        if os.path.isdir(outdir):
            for f in os.listdir(outdir):
                os.remove(os.path.join(outdir, f))
        metafile = os.path.join(ROOT, "data", "screens", f"{slug}.json")
        if not candidates:
            if os.path.isdir(outdir):
                os.rmdir(outdir)
            if os.path.exists(metafile):
                os.remove(metafile)
            print(slug, "no decent screenshots of", len(shots)); return None
        os.makedirs(outdir, exist_ok=True)
        meta = []
        for i, c in enumerate(pick(candidates), 1):
            img = c["img"]
            if img.width > 1400:
                img = img.resize((1400, int(img.height * 1400 / img.width)), Image.LANCZOS)
            if img.height > 2400:
                img = img.crop((0, 0, img.width, 2400))
            out = watermark(img)
            fn = f"{i:02d}.webp"
            out.save(os.path.join(outdir, fn), "WEBP", quality=78, method=6)
            meta.append({"src": f"/screens/{slug}/{fn}", "w": out.width, "h": out.height, "caption": c["caption"], "mobile": c["mobile"]})
        os.makedirs(os.path.join(ROOT, "data", "screens"), exist_ok=True)
        json.dump(meta, open(metafile, "w"), indent=1)
        print(slug, len(meta), "of", len(shots))
        return slug

if __name__ == "__main__":
    for p in sys.argv[1:]:
        process(p)
    # rebuild the index used by the site
    sdir = os.path.join(ROOT, "data", "screens")
    index = {f[:-5]: json.load(open(os.path.join(sdir, f))) for f in sorted(os.listdir(sdir)) if f.endswith(".json")}
    json.dump(index, open(os.path.join(ROOT, "data", "screens.json"), "w"))
    print("index:", len(index), "components with screenshots")
