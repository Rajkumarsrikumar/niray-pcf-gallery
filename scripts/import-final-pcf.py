"""Add components from a "Final PCF" deliverables folder (X_managed.zip, X_unmanaged.zip, X_USER_GUIDE.docx, README.md)
to the gallery.

Usage: python3 -I scripts/import-final-pcf.py <final_pcf_dir> <work_dir>

For each component not already in the gallery it writes data/source/extra-<slug>.json (name, tagline, description and
features from the user guide; version and control type from the managed solution's ControlManifest.xml; sector, category
and date from README.md), then builds a screenshot package per component from the guide's figures in <work_dir> and
runs prepare-data.py and watermark-screens.py. Run make-thumbs.py afterwards.
Only the managed solution and the user guide are read for listing data; no solution file is copied into the repo.
"""
import html, io, json, os, re, subprocess, sys, tarfile, zipfile
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "data", "source")
INDUSTRY = {"Cross-sector": "Cross-industry", "Cross-sector (built before sector days)": "Cross-industry"}


def slugify(name):
    return re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-z0-9])(?=[A-Z])", "-", name).lower()


def readme_rows(path):
    rows = {}
    for line in open(path, encoding="utf-8"):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 7 and cells[0] != "Component" and not cells[0].startswith("-"):
            rows[cells[0]] = {"date": cells[1], "sector": cells[2], "category": cells[3]}
    return rows


def paragraphs(docx):
    z = zipfile.ZipFile(docx)
    xml = z.read("word/document.xml").decode("utf-8")
    rels = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', z.read("word/_rels/document.xml.rels").decode()))
    out = []
    for p in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
        st = re.search(r'<w:pStyle w:val="([^"]+)"', p)
        text = html.unescape("".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p))).strip()
        imgs = [rels.get(r) for r in re.findall(r'r:embed="(rId\d+)"', p)]
        out.append({"style": st.group(1) if st else "", "text": text, "imgs": [i for i in imgs if i]})
    return z, out


def section(paras, title_re):
    """List items under the first Heading2 whose text matches title_re."""
    items, on = [], False
    for p in paras:
        if p["style"].startswith("Heading"):
            if on:
                break
            on = p["style"] == "Heading2" and bool(re.search(title_re, p["text"], re.I))
            continue
        if on and p["style"].startswith("ListParagraph") and p["text"]:
            items.append(p["text"].rstrip("."))
    return items


def manifest_features(desc):
    """The manifest description lists what the control does after a colon, separated by commas."""
    if ":" not in desc:
        return []
    body = desc.split(":", 1)[1]
    parts, depth, cur = [], 0, ""
    for ch in body:
        depth += ch == "("
        depth -= ch == ")"
        if depth == 0 and ch in ",;":
            parts.append(cur); cur = ""
        elif depth == 0 and ch == "." and cur.strip():
            parts.append(cur); cur = ""
        else:
            cur += ch
    parts.append(cur)
    out = []
    for t in parts:
        t = re.sub(r"^\s*(and|with|plus)\s+", "", t.strip()).strip(" .")
        if len(t) <= 3:
            continue
        if out and len(t.split()) <= 2:
            out[-1] += ", " + t
        else:
            out.append(t[:1].upper() + t[1:])
    return out if len(out) >= 3 else []


def looks(paras):
    """Heading2 titles under the "How it can look" chapter: each names one look or mode of the control."""
    out, on = [], False
    for p in paras:
        if p["style"] == "Heading1":
            on = "how it can look" in p["text"].lower()
        elif on and p["style"] == "Heading2" and p["text"]:
            out.append(p["text"].rstrip("."))
    return out


STOP = {"and", "the", "for", "with", "from", "into", "your", "app", "apps", "control", "field", "code", "component",
        "visual", "grid", "dataset", "sector", "built", "before", "days", "cross-sector"}


def first_sentence(t, limit=170):
    s = re.split(r"(?<=[.!?])\s+(?=[A-Z])", t)[0]
    if len(s) > limit:
        s = s[:limit].rsplit(" ", 1)[0].rstrip(",;:-") + "…"
    return s


def hosts_from(text):
    t = text.lower()
    hs = [h for k, h in (("canvas", "Canvas apps"), ("model-driven", "Model-driven apps"), ("power pages", "Power Pages")) if k in t]
    return hs or ["Canvas apps", "Model-driven apps"]


def manifest(managed):
    z = zipfile.ZipFile(managed)
    name = next(n for n in z.namelist() if n.endswith("ControlManifest.xml"))
    m = z.read(name).decode("utf-8")
    attr = dict(re.findall(r'([\w-]+)="([^"]*)"', re.search(r"<control ([^>]*)>", m).group(1)))
    pl = re.search(r'<platform-library name="React" version="([^"]+)"', m)
    react = pl.group(1) + " (platform library)" if pl else None
    schema = "pcfl_" + attr.get("namespace", "PCFLib") + "." + attr["constructor"]
    return attr, schema, react


def screenshot_package(comp, z, paras, work):
    """A small .tgz in the layout watermark-screens.py reads: <comp>_guide/docs/screenshots/NN-caption.png."""
    shots, pending = [], None
    for p in paras:
        if p["imgs"]:
            pending = p["imgs"][0]
            continue
        m = re.match(r"Figure \d+\s*[.:–—-]\s*(.+)", p["text"])
        if m and pending:
            cap = re.split(r"[:.;(]", m.group(1))[0].strip()
            cap = re.sub(r"[^A-Za-z0-9 &+-]", "", cap).strip()
            if len(cap) > 48:
                cap = cap[:48].rsplit(" ", 1)[0]
            cap = cap or "Overview"
            shots.append((pending, cap))
            pending = None
        elif p["text"]:
            pending = None
    if not shots:
        return None
    path = os.path.join(work, comp + ".tgz")
    with tarfile.open(path, "w:gz") as tf:
        for i, (target, cap) in enumerate(shots, 1):
            img = Image.open(io.BytesIO(z.read("word/" + target))).convert("RGB")
            buf = io.BytesIO()
            img.save(buf, "PNG")
            info = tarfile.TarInfo(f"{comp}_guide/docs/screenshots/{i:02d}-{cap}.png")
            info.size = buf.tell()
            buf.seek(0)
            tf.addfile(info, buf)
    return path


def main(final_dir, work):
    os.makedirs(work, exist_ok=True)
    gallery = json.load(open(os.path.join(ROOT, "data", "components.json")))
    have, slugs = {c["component"] for c in gallery}, {c["slug"] for c in gallery}
    rows = readme_rows(os.path.join(final_dir, "README.md"))
    comps = sorted({f[: -len("_managed.zip")] for f in os.listdir(final_dir) if f.endswith("_managed.zip")})
    tgzs, added, skipped = [], [], []
    for comp in comps:
        guide = os.path.join(final_dir, comp + "_USER_GUIDE.docx")
        if comp in have:
            skipped.append((comp, "already in gallery"))
            continue
        if not os.path.exists(guide) or not os.path.exists(os.path.join(final_dir, comp + "_unmanaged.zip")):
            skipped.append((comp, "missing user guide or unmanaged solution"))
            continue
        attr, schema, react = manifest(os.path.join(final_dir, comp + "_managed.zip"))
        z, paras = paragraphs(guide)
        intro = next((paras[i + 1]["text"] for i, p in enumerate(paras)
                      if p["style"] == "Heading1" and p["text"].startswith("1.") and i + 1 < len(paras)), "")
        intro = intro or attr.get("description-key", "")
        works = next((paras[i + 1]["text"] for i, p in enumerate(paras) if p["text"] == "Works in" and i + 1 < len(paras)), "")
        features = section(paras, r"what you get|features|what it does")
        if not features:
            features = manifest_features(attr.get("description-key", "")) or looks(paras)
        features = features[:10]
        r = rows.get(comp, {})
        sector = r.get("sector") or "Cross-sector"
        slug = slugify(comp)
        if slug in slugs:
            slug += "-pcf"
        slugs.add(slug)
        words = re.findall(r"[a-z][a-z-]{2,}", (slugify(comp).replace("-", " ") + " " + INDUSTRY.get(sector, sector)
                                                  + " " + r.get("category", "")).lower())
        tags = list(dict.fromkeys(w for w in words if w not in STOP))
        e = {
            "name": comp, "displayName": attr.get("display-name-key") or comp, "slug": slug,
            "tagline": first_sentence(intro), "description": intro, "features": features,
            "industry": INDUSTRY.get(sector, sector), "pack": None, "category": r.get("category"),
            "hosts": hosts_from(works + " " + r.get("category", "")), "tags": tags,
            "mobileResponsive": True, "complexity": "Advanced", "status": "final",
            "availability": "Coming soon", "componentVersion": attr.get("version"), "solutionVersion": None,
            "releaseDate": r.get("date"), "schemaName": schema, "react": react,
            "controlType": attr.get("control-type", "standard"), "userManual": comp + "_USER_GUIDE.docx",
            "screenshotCount": sum(1 for p in paras if p["imgs"]), "price": None,
        }
        json.dump(e, open(os.path.join(SRC, f"extra-{slug}.json"), "w"), indent=1, ensure_ascii=False)
        t = screenshot_package(comp, z, paras, work)
        if t:
            tgzs.append(t)
        added.append(slug)
    subprocess.run([sys.executable, "-I", os.path.join(ROOT, "scripts", "prepare-data.py")], check=True)
    if tgzs:
        subprocess.run([sys.executable, "-I", os.path.join(ROOT, "scripts", "watermark-screens.py"), *tgzs], check=True)
    print(len(added), "added;", len(skipped), "skipped:", skipped)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
