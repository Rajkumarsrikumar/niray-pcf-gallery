"""Turn the builder's catalog.json into public listing data (no prices, no internal paths)."""
import json, re, sys, ast

src = json.load(open(sys.argv[1]))
packs = list(src.get("completedIndustryPacks", [])) + [src.get("industryPlan", {})]

def slug(s):
    return re.sub(r"(?<!^)(?=[A-Z])", "-", s).lower().replace("_", "-")

def tags(v):
    if isinstance(v, list):
        return v
    try:
        return list(ast.literal_eval(v))
    except Exception:
        return [t.strip() for t in str(v).split(",") if t.strip()]

pack_of = {}
out_packs = []
for p in packs:
    if not p.get("packName"):
        continue
    names = [i["component"] for i in p.get("components", []) if i.get("status") in ("built", "pending-sync")]
    for n in names:
        pack_of[n] = p["packName"]
    out_packs.append({
        "slug": slug(p["packName"].replace("Niray ", "").replace(" PCF Pack", "").replace(" & ", " ").replace(" ", "")),
        "name": p["packName"],
        "industry": p.get("industry"),
        "complete": p in src.get("completedIndustryPacks", []),
        "components": names,
    })

comps = []
for c in src["components"]:
    name = c["component"]
    comps.append({
        "slug": slug(name),
        "name": name,
        "title": re.sub(r"(?<!^)(?=[A-Z])", " ", name),
        "industry": c.get("industry") or "Cross-industry",
        "category": c.get("category") or "General",
        "summary": (c.get("primaryUseCase") or "").strip(),
        "tags": tags(c.get("featureTags", []))[:12],
        "hosts": c.get("supportedHosts") or [],
        "mobile": bool(c.get("mobileResponsive")),
        "complexity": c.get("complexity") or "Advanced",
        "screenshots": c.get("screenshots") or 0,
        "date": c.get("date"),
        "pack": pack_of.get(name),
        "available": c.get("status") == "built",
        "price": None,
    })
comps.sort(key=lambda x: x["title"])
json.dump(comps, open("data/components.json", "w"), indent=1)
json.dump(out_packs, open("data/packs.json", "w"), indent=1)
print(len(comps), "components,", len(out_packs), "packs")
