import Link from "next/link";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import Hero, { type HeroPick } from "./Hero";
import Reveal from "./Reveal";
import { allComponents, allPacks, industries, industrySlug, isAvailable, packComponents, screensFor, themeFor } from "@/lib/catalog";

export const metadata = { alternates: { canonical: "/" } };

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": "https://niraypcfgallery.com/#org", name: "Niray IT Solutions Pte. Ltd.",
      url: "https://www.nirayitsolutions.com", logo: "https://niraypcfgallery.com/brand/nmark.png", email: "info@nirayitsolutions.com",
      sameAs: ["https://www.nirayitsolutions.com"],
    },
    {
      "@type": "WebSite", "@id": "https://niraypcfgallery.com/#website", name: "Niray PCF Gallery", url: "https://niraypcfgallery.com/",
      publisher: { "@id": "https://niraypcfgallery.com/#org" }, inLanguage: "en",
    },
  ],
};

const included = [
  { h: "A managed solution", b: "Import it into any environment. Upgrades install cleanly over the top." },
  { h: "A user manual for every component", b: "Setup steps for Canvas, Model-driven and Power Pages, with screenshots." },
  { h: "Built for phones too", b: "Every component is tested at 1366, 375, 360 and 320 pixels wide." },
  { h: "Nothing calls home", b: "React 16.14 is bundled, so components also run in Power Pages." },
];

export default function Home() {
  const available = allComponents.filter(isAvailable);
  // Ten of the strongest screenshots, spread across the industries.
  const heroSlugs = ["kanban-board", "card-controls-panel", "production-schedule-sequencer", "attendance-register", "variance-waterfall-chart",
    "patient-flow-queue", "gantt-timeline", "property-tax-bill-explainer", "pivot-data-explorer", "territory-mapper"];
  const picks = heroSlugs
    .map((s) => allComponents.find((c) => c.slug === s))
    .filter(Boolean)
    .map((c) => ({ c: c!, shot: screensFor(c!.slug).find((x) => !x.mobile)! }))
    .filter((p) => p.shot);
  const popular = ["advanced-editable-grid", "kanban-board", "mega-menu", "gantt-timeline", "event-calendar", "pivot-data-explorer", "resource-scheduler", "customer360-panel"]
    .map((s) => allComponents.find((c) => c.slug === s)).filter(Boolean) as typeof allComponents;
  const withShots = allComponents.filter((c) => screensFor(c.slug).length);
  const newest = [...withShots].sort((a, b) => (b.dateBuilt ?? "").localeCompare(a.dateBuilt ?? "")).slice(0, 4);
  // Prefer components with real screenshots until every package's screenshots are in; one per industry first.
  const shown = popular.filter((c) => screensFor(c.slug).length).length >= 8 ? popular
    : [...industries.flatMap((i) => withShots.filter((c) => c.industry === i && !newest.includes(c)).slice(0, 2)), ...popular].slice(0, 8);
  const heroPicks: HeroPick[] = picks.map(({ c, shot }) => ({ slug: c.slug, name: c.name, industry: c.industry, color: themeFor(c.industry).color, on: themeFor(c.industry).on, src: shot.src }));
  const chips = [{ label: "All components", href: "/components", color: "#003B5C" }, ...industries.filter((i) => i !== "Cross-industry").map((i) => ({ label: i.split(" & ")[0], href: `/components?industry=${industrySlug(i)}`, color: themeFor(i).color }))];
  const counts = Object.fromEntries(industries.map((i) => [i, allComponents.filter((c) => c.industry === i).length]));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      <Hero picks={heroPicks} chips={chips} total={allComponents.length} ready={available.length} />

      <section className="border-b border-line">
        <ul className="mx-auto grid max-w-7xl gap-x-8 gap-y-5 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {included.map((x, k) => (
            <li key={x.h} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-sky text-tile-blue"><Icon name={["box", "doc", "phone", "shield"][k]} className="h-[18px] w-[18px]" /></span>
              <span><span className="block font-semibold text-ink">{x.h}</span><span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">{x.b}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <Reveal className="mx-auto max-w-7xl px-4 pt-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">Popular right now</h2>
          <Link href="/components" className="hidden shrink-0 text-sm font-semibold text-tile-blue hover:underline sm:inline">Shop all {allComponents.length}</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{shown.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
      </Reveal>

      <Reveal className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">Shop by industry</h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((ind) => {
            const t = themeFor(ind);
            return (
              <Link key={ind} href={`/components?industry=${industrySlug(ind)}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-ink lg:flex-col lg:items-start lg:p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: t.soft, color: t.color === "#8DC63F" ? "#3E7A12" : t.color }}><Icon name={t.icon} className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug text-ink">{ind}</span>
                  <span className="text-sm text-ink-faint">{counts[ind]} components</span>
                </span>
              </Link>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-20 max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl bg-ink text-white">
          <div className="grid gap-10 p-7 sm:p-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Industry packs</h2>
              <p className="mt-4 max-w-md leading-relaxed text-white/75">Up to 30 components researched for one sector, built to work together and delivered as one managed solution with a pack catalogue.</p>
              <Link href="/packs" className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-ink transition-colors hover:bg-tile-sun">Compare packs</Link>
            </div>
            <ul className="divide-y divide-white/15">
              {allPacks.map((p) => {
                const t = themeFor(p.industry);
                const n = packComponents(p).length;
                return (
                  <li key={p.slug}>
                    <Link href={`/packs/${p.slug}`} className="group flex items-center gap-4 py-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10" style={{ color: t.color === "#003B5C" ? "#8DC63F" : t.color === "#5B7B8C" ? "#B9CDD8" : t.color === "#007B7F" ? "#5FD0D3" : t.color }}><Icon name={t.icon} className="h-5 w-5" /></span>
                      <span className="flex-1">
                        <span className="block text-lg font-bold tracking-tight group-hover:underline">{p.name.replace("Niray ", "")}</span>
                        <span className="text-sm text-white/60">{p.status === "complete" ? `${n} components` : `${n} of ${p.planned} built so far`}</span>
                      </span>
                      <Icon name="arrow" className="h-5 w-5 text-white/50 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="mb-7 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">New this week</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{newest.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
      </Reveal>

      <Reveal className="mx-auto max-w-7xl px-4 pt-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-line bg-paper p-7 sm:flex-row sm:items-center sm:p-12">
          <span className="flex-1">
            <span className="block text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">Need a component that isn&apos;t here?</span>
            <span className="mt-2 block max-w-xl text-ink-soft">We build new PCF controls, or tailor any component in the gallery to your process and data.</span>
          </span>
          <Link href="/custom" className="rounded-xl bg-ink px-6 py-3.5 font-semibold text-white transition-colors hover:bg-tile-blue">Request custom development</Link>
        </div>
      </Reveal>
    </>
  );
}
