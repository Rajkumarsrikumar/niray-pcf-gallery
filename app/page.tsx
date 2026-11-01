import Link from "next/link";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import StudioCanvas from "./StudioCanvas";
import { allComponents, allPacks, industries, industrySlug, isAvailable, packComponents, screensFor, themeFor } from "@/lib/catalog";

const included = [
  { h: "A managed solution", b: "Import it into any environment. Upgrades install cleanly over the top." },
  { h: "A user manual for every component", b: "Setup steps for Canvas, Model-driven and Power Pages, with screenshots." },
  { h: "Built for phones too", b: "Every component is tested at 1366, 375, 360 and 320 pixels wide." },
  { h: "Nothing calls home", b: "React 16.14 is bundled, so components also run in Power Pages." },
];

export default function Home() {
  const available = allComponents.filter(isAvailable);
  const heroSlugs = ["card-controls-panel", "school-timetable-grid", "benefit-eligibility-screener", "claim-reserve-worksheet", "polling-place-finder"];
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
  const counts = Object.fromEntries(industries.map((i) => [i, allComponents.filter((c) => c.industry === i).length]));

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[5fr_7fr] lg:py-20">
          <div>
            <h1 className="max-w-xl text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink sm:text-6xl">Drop-in components for Power Apps and Power Pages.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              {allComponents.length} code components, from editable grids to claims intake, ready to import into your environment. {available.length} are ready to download today and the rest are built and tested.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/components" className="rounded-lg bg-ink px-6 py-3.5 font-semibold text-white transition-colors hover:bg-tile-blue">Browse all {allComponents.length} components</Link>
              <Link href="/packs" className="rounded-lg border border-ink/20 px-6 py-3.5 font-semibold text-ink transition-colors hover:border-ink">See industry packs</Link>
            </div>
            <p className="mt-6 text-sm text-ink-faint">Try it: pick a component in the tree view.</p>
          </div>
          {picks.length > 0 && <StudioCanvas picks={picks} />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold text-ink">In every download</h2>
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {included.map((x) => (
            <div key={x.h} className="border-t-2 border-ink pt-4">
              <h3 className="font-bold text-ink">{x.h}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Shop by industry</h2>
        <div className="mt-8 grid auto-rows-[150px] grid-cols-2 gap-3 lg:grid-cols-4">
          {industries.map((ind, k) => {
            const t = themeFor(ind);
            const big = k === 0;
            return (
              <Link key={ind} href={`/components?industry=${industrySlug(ind)}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-lg p-5 transition-transform hover:-translate-y-0.5 ${big ? "col-span-2 row-span-2" : ""}`}
                style={{ background: t.color, color: t.on }}>
                <span className={`font-display font-extrabold leading-none tracking-tight ${big ? "text-8xl" : "text-5xl"}`}>{counts[ind]}</span>
                <span>
                  <span className={`block font-display font-bold leading-tight ${big ? "text-3xl" : "text-lg"}`}>{ind}</span>
                  {big && <span className="mt-2 block max-w-sm text-sm opacity-85">{t.blurb}</span>}
                </span>
                <Icon name={t.icon} className={`absolute right-4 top-4 opacity-30 ${big ? "h-24 w-24" : "h-10 w-10"}`} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Works in any business app</h2>
          <Link href="/components" className="hidden shrink-0 font-semibold text-tile-blue hover:underline sm:inline">View all components</Link>
        </div>
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{shown.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Industry packs</h2>
              <p className="mt-4 max-w-md leading-relaxed text-white/75">Up to 30 components researched for one sector, built to work together and delivered as one solution with a pack catalogue.</p>
              <Link href="/packs" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-ink hover:bg-tile-sun">Compare packs</Link>
            </div>
            <ul className="divide-y divide-white/15 border-y border-white/15">
              {allPacks.map((p) => {
                const t = themeFor(p.industry);
                const n = packComponents(p).length;
                return (
                  <li key={p.slug}>
                    <Link href={`/packs/${p.slug}`} className="group flex items-center gap-4 py-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md" style={{ background: t.color, color: t.on }}><Icon name={t.icon} className="h-6 w-6" /></span>
                      <span className="flex-1">
                        <span className="block font-display text-lg font-bold group-hover:underline">{p.name.replace("Niray ", "")}</span>
                        <span className="text-sm text-white/65">{p.status === "complete" ? `${n} components` : `${n} of ${p.planned} built so far`}</span>
                      </span>
                      <Icon name="arrow" className="h-5 w-5 text-white/50 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">New this week</h2>
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{newest.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <Link href="/custom" className="canvas-dots group flex flex-col items-start gap-5 rounded-xl border-2 border-dashed border-ink/30 p-8 transition-colors hover:border-tile-blue sm:flex-row sm:items-center sm:p-12">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border-2 border-dashed border-ink/40 text-3xl font-light text-ink/60 group-hover:border-tile-blue group-hover:text-tile-blue">+</span>
          <span className="flex-1">
            <span className="block font-display text-2xl font-extrabold text-ink sm:text-3xl">Need a component that isn&apos;t here?</span>
            <span className="mt-1 block text-ink-soft">We build new PCF controls or tailor any gallery component to your process and data.</span>
          </span>
          <span className="rounded-lg bg-ink px-6 py-3.5 font-semibold text-white group-hover:bg-tile-blue">Request custom development</span>
        </Link>
      </section>
    </>
  );
}
