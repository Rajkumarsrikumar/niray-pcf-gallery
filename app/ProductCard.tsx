import Link from "next/link";
import ProductArt from "./ProductArt";
import AddToCart from "./AddToCart";
import { isAvailable, screensFor, themeFor, type Component } from "@/lib/catalog";

export default function ProductCard({ c }: { c: Component }) {
  const t = themeFor(c.industry);
  const shot = screensFor(c.slug).find((s) => !s.mobile);
  return (
    <article className="group relative flex flex-col">
      {/* folder-style tab in the industry colour */}
      <span className="relative z-[1] -mb-px inline-flex w-fit items-center gap-1.5 rounded-t-md px-2.5 py-1 text-xs font-semibold" style={{ background: t.color, color: t.on }}>
        {c.industry}
      </span>
      <div className="flex flex-1 flex-col overflow-hidden rounded-b-lg rounded-tr-lg border border-line bg-white transition-colors group-hover:border-ink/40">
        <div className="relative overflow-hidden border-b border-line">
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.src} alt="" loading="lazy" className="h-[180px] w-full bg-paper object-cover object-top" />
          ) : (
            <div className="h-[180px] overflow-hidden"><ProductArt c={c} /></div>
          )}
          {!isAvailable(c) && <span className="absolute left-3 top-3 rounded bg-white px-2 py-0.5 text-xs font-semibold text-ink shadow-sm ring-1 ring-line">Coming soon</span>}
          <div className="absolute right-3 top-3 z-10">
            <AddToCart item={{ slug: c.slug, name: c.name, kind: "component" }} variant="icon" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-lg font-bold leading-snug text-ink">
            <Link href={`/components/${c.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">{c.name}</Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{c.tagline}</p>
          <div className="mt-auto flex items-baseline justify-between gap-3 pt-4 text-sm">
            <span className="font-semibold text-ink">{c.price ? `$${c.price}` : "Price on request"}</span>
            <span className="text-ink-faint">{isAvailable(c) ? "Ready to download" : "Built and tested"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
