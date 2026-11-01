import Link from "next/link";
import AddToCart from "../AddToCart";
import Icon from "../Icon";
import { allPacks, isAvailable, packComponents, themeFor } from "@/lib/catalog";

export const metadata = { title: "Industry packs | Niray PCF Gallery" };

export default function Packs() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm text-slate-500">Home / Industry packs</p>
      <h1 className="mt-1 text-3xl font-extrabold text-brand-navy sm:text-4xl">Industry packs</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Up to 30 components researched for one sector and delivered as a single solution, with a pack catalogue.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {allPacks.map((p) => {
          const t = themeFor(p.industry);
          const items = packComponents(p);
          const ready = items.filter(isAvailable).length;
          return (
            <div key={p.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl">
              <Link href={`/packs/${p.slug}`} className="block p-7 text-white" style={{ background: `linear-gradient(140deg, ${t.from}, ${t.to})` }}>
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Icon name={t.icon} className="h-7 w-7" /></span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold">{p.status === "complete" ? "Complete pack" : `In progress · ${items.length}/${p.planned}`}</span>
                </div>
                <h2 className="mt-8 text-2xl font-extrabold">{p.name}</h2>
                <p className="mt-1 text-sm text-white/80">{t.blurb}</p>
              </Link>
              <div className="p-6">
                <div className="flex gap-6 text-sm">
                  <div><p className="text-2xl font-extrabold text-brand-navy">{items.length}</p><p className="text-slate-500">components</p></div>
                  <div><p className="text-2xl font-extrabold text-brand-green">{ready}</p><p className="text-slate-500">in stock</p></div>
                  <div className="ml-auto text-right"><p className="text-sm text-slate-500">Bundle price</p><p className="text-xl font-extrabold text-brand-navy">{p.price ? `$${p.price}` : "On request"}</p></div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link href={`/packs/${p.slug}`} className="rounded-xl border border-slate-300 py-3 text-center font-semibold text-brand-navy hover:border-brand-blue">View pack</Link>
                  <AddToCart item={{ slug: p.slug, name: p.name, kind: "pack" }} label="Add pack" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
