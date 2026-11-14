"use client";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../ProductCard";
import Icon from "../Icon";
import { allComponents, categories, industries, industrySlug, isAvailable } from "@/lib/catalog";

type Sort = "featured" | "az" | "newest";

export default function Shop() {
  const [q, setQ] = useState("");
  const [inds, setInds] = useState<string[]>([]);
  // Read ?q= and ?industry= after load, so the full list is prerendered into the page's HTML for search engines.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startIndustry = industries.find((i) => industrySlug(i) === params.get("industry"));
    if (params.get("q")) setQ(params.get("q")!);
    if (startIndustry) setInds([startIndustry]);
  }, []);
  const [cat, setCat] = useState("All");
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = allComponents.filter(
      (c) =>
        (inds.length === 0 || inds.includes(c.industry)) &&
        (cat === "All" || c.category === cat) &&
        (!stockOnly || isAvailable(c)) &&
        (!s || `${c.name} ${c.tagline} ${c.description} ${c.tags.join(" ")}`.toLowerCase().includes(s)),
    );
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "newest") return [...list].sort((a, b) => (b.dateBuilt ?? "").localeCompare(a.dateBuilt ?? ""));
    return [...list].sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)) || a.name.localeCompare(b.name));
  }, [q, inds, cat, stockOnly, sort]);

  const toggle = (i: string) => setInds((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  const reset = () => { setQ(""); setInds([]); setCat("All"); setStockOnly(false); };

  const filters = (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-sm font-bold text-ink">Industry</p>
        <div className="space-y-2">
          {industries.map((i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input type="checkbox" checked={inds.includes(i)} onChange={() => toggle(i)} className="h-4 w-4 rounded border-slate-300 accent-brand-blue" />
              <span className="flex-1">{i}</span><span className="text-xs text-slate-400">{allComponents.filter((c) => c.industry === i).length}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold text-ink">Availability</p>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="h-4 w-4 accent-brand-blue" /> Ready to download now
        </label>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold text-ink">Category</p>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="All">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={reset} className="text-sm font-medium text-brand-blue hover:underline">Clear all filters</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
                <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">All PCF components</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, feature or tag" aria-label="Search components"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium lg:hidden" aria-expanded={filtersOpen}>Filters{inds.length + (stockOnly ? 1 : 0) + (cat !== "All" ? 1 : 0) ? ` (${inds.length + (stockOnly ? 1 : 0) + (cat !== "All" ? 1 : 0)})` : ""}</button>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="featured">Sort: Featured</option>
                <option value="newest">Sort: Newest</option>
                <option value="az">Sort: A–Z</option>
              </select>
            </div>
          </div>
          {filtersOpen && <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">{filters}</div>}
          <p className="mb-4 text-sm text-slate-500"><span className="font-semibold text-brand-navy">{shown.length}</span> results</p>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{shown.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
          {shown.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
              <p className="font-semibold text-brand-navy">No components match these filters.</p>
              <button onClick={reset} className="mt-2 text-sm text-brand-blue hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
