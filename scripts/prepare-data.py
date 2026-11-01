"""Build data/components.json and data/packs.json from the Niray PCF website data pack in data/source/.

data/source/components.json and packs.json come from Niray-PCF-Website-Data.zip (website-data/).
data/source/extra-*.json are single components from the older export that the newer pack did not include yet.
Run: npm run data
"""
import glob
import json
import os

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "data", "source")
out = os.path.join(here, "..", "data")

comps = json.load(open(os.path.join(src, "components.json")))["components"]
packs = json.load(open(os.path.join(src, "packs.json")))
slugs = {c["slug"] for c in comps}

for f in sorted(glob.glob(os.path.join(src, "extra-*.json"))):
    e = json.load(open(f))
    if e["slug"] in slugs:
        continue
    comps.append({
        "name": e.get("displayName") or e["name"], "component": e["name"], "slug": e["slug"],
        "schemaName": e["schemaName"], "tagline": e["tagline"], "description": e.get("description", ""),
        "features": e.get("features", []), "category": e.get("category"), "subCategory": None,
        "industry": e["industry"], "pack": e.get("pack"), "packOrder": None, "hosts": e["hosts"],
        "mobileResponsive": e.get("mobileResponsive", True), "complexity": e.get("complexity", "Advanced"),
        "tags": e.get("tags", []), "availability": e["availability"],
        "componentVersion": e.get("componentVersion"), "solutionVersion": e.get("solutionVersion"),
        "controlType": e.get("controlType"), "react": e.get("react"),
        "screenshotCount": e.get("screenshotCount", 0), "dateBuilt": e.get("releaseDate"), "price": None,
    })
    slugs.add(e["slug"])

keep = ["name", "component", "slug", "schemaName", "tagline", "description", "features", "category", "subCategory",
        "industry", "pack", "packOrder", "hosts", "mobileResponsive", "complexity", "tags", "availability",
        "componentVersion", "solutionVersion", "controlType", "react", "screenshotCount", "dateBuilt", "price"]
# Server-only file names for emailed downloads (free first component). Not imported by any page.
delivery = {}
for c in comps:
    files = c.get("solutionFiles") or []
    managed = next((f for f in files if f.endswith("_managed.zip")), None)
    manual = next((f for f in files if f.endswith("_User-Manual.docx")), None)
    if c.get("availability") == "Available" and managed and manual:
        delivery[c["slug"]] = {"component": c["component"], "managed": managed, "manualPdf": manual[: -len(".docx")] + ".pdf"}

comps = sorted(({k: c.get(k) for k in keep} for c in comps), key=lambda c: c["name"])
for c in comps:
    c["description"] = c["description"] or ""
    c["features"] = c["features"] or []
    c["tags"] = c["tags"] or []
by_name = {c["component"]: c for c in comps}

out_packs = []
for p in packs:
    items = []
    for i in sorted(p["components"], key=lambda i: i["order"]):
        c = by_name.get(i["component"])
        if c:
            c["packOrder"] = c["packOrder"] or i["order"]
            c["subCategory"] = c["subCategory"] or i.get("subCategory")
            items.append({"slug": c["slug"], "subCategory": i.get("subCategory") or "Other"})
    out_packs.append({"slug": p["slug"], "name": p["packName"], "industry": p["industry"], "status": p["status"],
                      "planned": p["componentsPlanned"], "components": items, "price": p.get("price")})

json.dump(comps, open(os.path.join(out, "components.json"), "w"), indent=1, ensure_ascii=False)
json.dump(out_packs, open(os.path.join(out, "packs.json"), "w"), indent=1, ensure_ascii=False)
json.dump(delivery, open(os.path.join(out, "delivery.json"), "w"), indent=1, ensure_ascii=False)
print(len(comps), "components;", ", ".join(f"{p['slug']}={len(p['components'])}" for p in out_packs))
