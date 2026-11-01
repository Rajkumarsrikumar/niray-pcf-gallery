import Link from "next/link";
import ProductArt from "./ProductArt";
import AddToCart from "./AddToCart";
import { isAvailable, screensFor, themeFor, thumbOf, type Component } from "@/lib/catalog";

export default function ProductCard({ c }: { c: Component }) {
  const t = themeFor(c.industry);
  const shot = screensFor(c.slug).find((s) => !s.mobile);
  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-paper transition-shadow duration-300 group-hover:shadow-[0_18px_40px_-22px_rgba(0,59,92,0.55)]">
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbOf(shot.src)} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="aspect-[4/3] overflow-hidden"><ProductArt c={c} /></div>
        )}
        {!isAvailable(c) && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">Coming soon</span>}
        <div className="absolute right-3 top-3 z-10">
          <AddToCart item={{ slug: c.slug, name: c.name, kind: "component" }} variant="icon" />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-1 pt-3.5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-ink-faint"><i className="h-2 w-2 rounded-full" style={{ background: t.color }} />{c.industry}</p>
        <h3 className="mt-1 text-[17px] font-bold leading-snug tracking-tight text-ink">
          <Link href={`/components/${c.slug}`} prefetch={false} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">{c.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">{c.tagline}</p>
        <p className="mt-auto pt-3 text-sm font-semibold text-ink">{c.price ? `$${c.price}` : "Price on request"}</p>
      </div>
    </article>
  );
}
