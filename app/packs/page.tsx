import Link from "next/link";
import AddToCart from "../AddToCart";
import Icon from "../Icon";
import { PRICE, allPacks, formatPrice, isAvailable, packComponents, packPreviews, themeFor, thumbOf } from "@/lib/catalog";

export const metadata = { keywords: ["Power Apps industry templates", "PCF component packs", "healthcare Power Apps", "financial services Power Apps", "public sector Power Apps", "education Power Apps", "manufacturing Power Apps", "real estate Power Apps"], title: "Industry PCF packs for Power Apps | Niray PCF Gallery", description: "Industry packs of Power Apps PCF code components for healthcare, financial services, education, government, manufacturing and more.", alternates: { canonical: "/packs" } };

export default function Packs() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
            <h1 className="mt-1 text-3xl font-extrabold text-brand-navy sm:text-4xl">Industry packs</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Up to 30 components researched for one sector and delivered as a single solution, with a pack catalogue.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {allPacks.map((p) => {
          const t = themeFor(p.industry);
          const items = packComponents(p);
          const ready = items.filter(isAvailable).length;
          return (
            <div key={p.slug} className="overflow-hidden rounded-lg border border-line bg-white">
              <Link href={`/packs/${p.slug}`} className="block p-7" style={{ background: t.color, color: t.on }}>
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Icon name={t.icon} className="h-7 w-7" /></span>
                  <span className="rounded bg-black/15 px-2.5 py-1 text-xs font-semibold">{p.status === "complete" ? "Complete pack" : `In progress · ${items.length}/${p.planned}`}</span>
                </div>
                <h2 className="mt-8 text-2xl font-extrabold">{p.name}</h2>
                <p className="mt-1 text-sm opacity-85">{t.blurb}</p>
                {packPreviews(p, 6).length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {packPreviews(p, 6).map((s) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={s.src} src={thumbOf(s.src)} alt={s.caption} loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-white object-cover object-left-top shadow-md ring-1 ring-black/10" />
                    ))}
                  </div>
                )}
              </Link>
              <div className="p-6">
                <div className="flex gap-6 text-sm">
                  <div><p className="text-2xl font-extrabold text-brand-navy">{items.length}</p><p className="text-slate-500">components</p></div>
                  <div><p className="text-2xl font-extrabold text-brand-green">{ready}</p><p className="text-slate-500">in stock</p></div>
                  <div className="ml-auto text-right"><p className="text-sm text-slate-500">Bundle price</p><p className="text-xl font-extrabold text-brand-navy">{formatPrice(PRICE.pack)}</p></div>
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
