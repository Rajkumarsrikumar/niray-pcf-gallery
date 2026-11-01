import Link from "next/link";
import ProductArt from "./ProductArt";
import AddToCart from "./AddToCart";
import { isAvailable, screensFor, themeFor, type Component } from "@/lib/catalog";

export default function ProductCard({ c }: { c: Component }) {
  const t = themeFor(c.industry);
  const shot = screensFor(c.slug).find((s) => !s.mobile);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/components/${c.slug}`} className="block overflow-hidden" tabIndex={-1} aria-hidden="true">
        <div className="transition duration-500 group-hover:scale-105">
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.src} alt="" loading="lazy" className="h-[178px] w-full bg-slate-100 object-cover object-top" />
          ) : <ProductArt c={c} />}
        </div>
      </Link>
      <div className="absolute left-3 top-3 flex gap-1.5">
        {isAvailable(c) ? (
          <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-brand-green shadow">● In stock</span>
        ) : (
          <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-amber-950 shadow">Coming soon</span>
        )}
      </div>
      <div className="absolute right-3 top-3 z-10 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <AddToCart item={{ slug: c.slug, name: c.name, kind: "component" }} variant="icon" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: t.to }}>{c.industry}</p>
        <h3 className="mt-1 font-semibold leading-snug text-brand-navy">
          <Link href={`/components/${c.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline">{c.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.tagline}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] text-slate-400">Price</p>
            <p className="font-bold text-brand-navy">{c.price ? `$${c.price}` : "On request"}</p>
          </div>
          <p className="text-[11px] text-slate-400">{c.screenshotCount ? `${c.screenshotCount} screens · ` : ""}v{c.componentVersion}</p>
        </div>
      </div>
    </div>
  );
}
