"""Bring new components from the Niray PCF Library into the gallery.

The library's scheduled builder publishes catalog.json (mirror artifact) and keeps each new component as a
base64 .tgz in an archive-store artifact (catalog entry: archiveStore + archiveFiles). Fetching those files
needs the Artifact tool, so this script works in two steps:

  1. plan:   python3 -I scripts/sync-library.py plan <catalog.json>
             Prints JSON {store_url: [archive file paths]} for components not yet in the gallery.
             Download each file into <dl_dir>, keeping its path (e.g. <dl_dir>/pending/X.tgz.b64.txt).

  2. apply:  python3 -I scripts/sync-library.py apply <catalog.json> <dl_dir> <tgz_dir>
             Decodes the packages into <tgz_dir>, writes data/source/extra-<slug>.json from each package's
             website/<Name>.json, refreshes pack data in data/source/packs.json, then runs prepare-data.py
             and watermark-screens.py. Run make-thumbs.py afterwards.
"""
import base64, glob, io, json, os, re, subprocess, sys, tarfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "data", "source")
HOST = {"Canvas": "Canvas apps", "Model-driven": "Model-driven apps", "Power Pages": "Power Pages"}
HOST_ORDER = ["Canvas apps", "Model-driven apps", "Power Pages"]


def gallery_components():
    return {c["component"] for c in json.load(open(os.path.join(ROOT, "data", "components.json")))}


def new_entries(cat):
    have = gallery_components()
    return [c for c in cat["components"] if c["component"] not in have and c.get("archiveFiles")]


def plan(cat):
    out = {}
    for c in new_entries(cat):
        out.setdefault(c["archiveStore"], []).extend(c["archiveFiles"])
    print(json.dumps(out, indent=1))


def slugify(name):
    return re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", name).lower()


def to_extra(c, w):
    name = w.get("name") or c["component"]
    if name.startswith("Niray "):
        name = name[6:]
    hosts = sorted({HOST.get(h, h) for h in (w.get("hosts") or c.get("supportedHosts") or [])},
                   key=lambda h: HOST_ORDER.index(h) if h in HOST_ORDER else 9)
    return {
        "name": c["component"], "displayName": name, "slug": w.get("slug") or slugify(c["component"]),
        "tagline": w.get("tagline") or c.get("primaryUseCase", "")[:120], "description": w.get("description", ""),
        "features": w.get("features", []), "industry": c.get("industry") or w.get("industry") or "Cross-industry",
        "pack": w.get("pack"), "category": c.get("category"), "hosts": hosts, "tags": c.get("featureTags", []),
        "mobileResponsive": c.get("mobileResponsive", True), "complexity": c.get("complexity", "Advanced"),
        "status": c["status"], "availability": "Available" if c["status"] == "built" else "Coming soon",
        "componentVersion": w.get("version") or c.get("version"), "solutionVersion": c.get("solutionVersion"),
        "releaseDate": c.get("date"), "schemaName": w.get("schemaName") or "niray_Niray." + c["component"],
        "react": c.get("react"), "controlType": c.get("controlType"),
        "userManual": os.path.basename(w.get("manual") or c.get("manual") or ""),
        "screenshotCount": len(w.get("screenshots") or []) or c.get("screenshots", 0), "price": None,
    }


def refresh_packs(cat, slugs):
    """Adds packs the gallery doesn't have yet and updates status/order from the library's industry plans."""
    path = os.path.join(SRC, "packs.json")
    packs = json.load(open(path))
    plans = [(p, "complete") for p in cat.get("completedIndustryPacks", [])]
    if cat.get("industryPlan"):
        plans.append((cat["industryPlan"], "in progress"))
    status_of = {c["component"]: c["status"] for c in cat["components"]}
    for plan_, status in plans:
        slug = re.sub(r"[^a-z0-9]+", "-", plan_["packName"].lower().replace("niray ", "").replace("&", "and")).strip("-")
        existing = next((p for p in packs if p["packName"] == plan_["packName"] or p["slug"] == slug), None)
        items = [{"order": i["order"], "component": i["component"],
                  "slug": slugs.get(i["component"]) or (existing and next((x.get("slug") for x in existing["components"] if x["component"] == i["component"]), None)),
                  "subCategory": i.get("subCategory"), "status": status_of.get(i["component"], i.get("status"))}
                 for i in plan_.get("components", [])]
        built = sum(1 for i in plan_.get("components", []) if i["component"] in status_of)
        if existing:
            existing["status"] = status if built >= plan_.get("target", 30) or status == "in progress" else existing["status"]
            existing["componentsBuilt"] = built
            known = {x["component"] for x in existing["components"]}
            existing["components"] += [i for i in items if i["component"] not in known]
            for x in existing["components"]:
                x["slug"] = x.get("slug") or slugs.get(x["component"])
        else:
            packs.append({"packName": plan_["packName"], "slug": slug, "industry": plan_["industry"], "status": status,
                          "componentsPlanned": plan_.get("target", 30), "componentsBuilt": built, "price": None,
                          "components": items})
            print("new pack:", plan_["packName"])
    json.dump(packs, open(path, "w"), indent=1, ensure_ascii=False)


def apply(cat, dl_dir, tgz_dir):
    os.makedirs(tgz_dir, exist_ok=True)
    slugs, tgzs = {}, []
    for c in new_entries(cat):
        try:
            data = b"".join(open(os.path.join(dl_dir, f)).read().strip().encode() for f in c["archiveFiles"])
        except FileNotFoundError as e:
            print("SKIP", c["component"], "missing", e.filename); continue
        raw = base64.b64decode(data)
        tgz = os.path.join(tgz_dir, c["folder"] + ".tgz")
        open(tgz, "wb").write(raw)
        try:
            with tarfile.open(tgz) as tf:
                m = next((m for m in tf.getmembers() if re.search(r"/website/[^/]+\.json$", m.name)), None)
                w = json.load(tf.extractfile(m)) if m else {}
        except (tarfile.TarError, OSError, ValueError) as e:
            print("SKIP", c["component"], "bad package", e); continue
        e = to_extra(c, w)
        json.dump(e, open(os.path.join(SRC, f"extra-{e['slug']}.json"), "w"), indent=1, ensure_ascii=False)
        slugs[c["component"]] = e["slug"]
        tgzs.append(tgz)
        print("added", e["slug"], e["industry"], e["availability"])
    refresh_packs(cat, slugs)
    subprocess.run([sys.executable, "-I", os.path.join(ROOT, "scripts", "prepare-data.py")], check=True)
    if tgzs:
        subprocess.run([sys.executable, "-I", os.path.join(ROOT, "scripts", "watermark-screens.py"), *tgzs], check=True)
    print(len(slugs), "new components")


if __name__ == "__main__":
    cmd, cat = sys.argv[1], json.load(open(sys.argv[2]))
    if cmd == "plan":
        plan(cat)
    elif cmd == "apply":
        apply(cat, sys.argv[3], sys.argv[4])
    else:
        sys.exit(__doc__)
