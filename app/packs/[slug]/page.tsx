import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "../../AddToCart";
import Icon from "../../Icon";
import ProductCard from "../../ProductCard";
import { packKeywords } from "@/lib/seo";
import { HEALTH_NOTICE, PRICE, allComponents, allPacks, formatPrice, getPack, isAvailable, packPreviews, themeFor, thumbOf } from "@/lib/catalog";

export function generateStaticParams() {
  return allPacks.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPack(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} – ${p.industry} Power Apps PCF controls | Niray`,
    description: `${p.name}: ${p.components.length} Power Apps PCF code components for ${p.industry}, for Canvas apps, Model-driven apps and Power Pages.`,
    keywords: packKeywords(p),
    alternates: { canonical: `/packs/${p.slug}` },
  };
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
            {packPreviews(p, 4).length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {packPreviews(p, 4).map((s) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={s.src} src={thumbOf(s.src)} alt={s.caption} loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-white object-cover object-left-top shadow-md ring-1 ring-black/10" />
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg bg-white p-6 text-ink shadow-lg">
            <p className="text-sm text-slate-500">Bundle price</p>
            <p className="text-3xl font-extrabold text-brand-navy">{formatPrice(PRICE.pack)}</p>
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
        {packPreviews(p).length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 text-xl font-bold text-brand-navy">See the pack in action</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packPreviews(p).map((s) => (
                <Link key={s.src} href={`/components/${s.slug}`} prefetch={false} className="group block overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbOf(s.src)} alt={`${s.name}: ${s.caption}`} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.02]" />
                  <p className="border-t border-line px-4 py-3 text-sm font-semibold text-ink">{s.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
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
