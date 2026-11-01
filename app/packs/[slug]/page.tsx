import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "../../AddToCart";
import Icon from "../../Icon";
import ProductCard from "../../ProductCard";
import { HEALTH_NOTICE, allComponents, allPacks, getPack, isAvailable, themeFor } from "@/lib/catalog";

export function generateStaticParams() {
  return allPacks.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPack(params.slug);
  return p ? { title: `${p.name} | Niray PCF Gallery` } : {};
}

export default function PackPage({ params }: { params: { slug: string } }) {
  const p = getPack(params.slug);
  if (!p) notFound();
  const t = themeFor(p.industry);
  const groups = new Map<string, typeof allComponents>();
  for (const i of p.components) {
    const c = allComponents.find((x) => x.slug === i.slug);
    if (c) groups.set(i.subCategory, [...(groups.get(i.subCategory) ?? []), c]);
  }
  const all = Array.from(groups.values()).flat();
  return (
    <>
      <section style={{ background: t.color, color: t.on }}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <Link href="/packs" className="text-sm opacity-80 hover:opacity-100">← All packs</Link>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{p.name}</h1>
            <p className="mt-3 max-w-xl text-lg opacity-90">{t.blurb} {all.length} components, grouped by workflow, in one solution.</p>
            {p.status !== "complete" && <p className="mt-3 inline-block rounded-full bg-black/20 px-3 py-1 text-sm">Pack in progress: {all.length} of {p.planned} built so far</p>}
          </div>
          <div className="rounded-lg bg-white p-6 text-ink shadow-lg">
            <p className="text-sm text-slate-500">Bundle price</p>
            <p className="text-3xl font-extrabold text-brand-navy">{p.price ? `$${p.price}` : "On request"}</p>
            <ul className="my-5 space-y-2 text-sm">
              {[`${all.length} components`, `${all.filter(isAvailable).length} in stock now`, "One managed solution", "Pack catalogue + user manuals"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-brand-green" />{x}</li>
              ))}
            </ul>
            <AddToCart item={{ slug: p.slug, name: p.name, kind: "pack" }} label="Add pack to basket" />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12">
        {p.industry.startsWith("Healthcare") && <p className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{HEALTH_NOTICE}</p>}
        {Array.from(groups.entries()).map(([g, items]) => (
          <section key={g} className="mb-12">
            <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-brand-navy">{g}<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{items.length}</span></h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}
