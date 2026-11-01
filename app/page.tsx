import Link from "next/link";
import Icon from "./Icon";
import ProductArt from "./ProductArt";
import ProductCard from "./ProductCard";
import { allComponents, allPacks, industries, industrySlug, isAvailable, packComponents, screensFor, themeFor } from "@/lib/catalog";

const perks = [
  { icon: "box", title: "Managed + unmanaged", body: "Solution zips for dev, test and production" },
  { icon: "doc", title: "User manual included", body: "Step-by-step setup for every host" },
  { icon: "phone", title: "Mobile-first", body: "Tested at 1366, 375, 360 and 320 px" },
  { icon: "shield", title: "No external calls", body: "React 16.14 bundled, works in Power Pages" },
];

export default function Home() {
  const available = allComponents.filter(isAvailable);
  const featured = ["advanced-editable-grid", "kanban-board", "mega-menu", "gantt-timeline", "event-calendar", "pivot-data-explorer", "resource-scheduler", "customer360-panel"]
    .map((s) => allComponents.find((c) => c.slug === s)).filter(Boolean).slice(0, 8) as typeof allComponents;
  const shown = featured.length >= 4 ? featured : available.slice(0, 8);
  const newest = [...allComponents].sort((a, b) => (b.dateBuilt ?? "").localeCompare(a.dateBuilt ?? "")).slice(0, 4);
  const heroPicks = ["card-controls-panel", "claim-reserve-worksheet", "school-timetable-grid"].map((s) => allComponents.find((c) => c.slug === s)).filter(Boolean) as typeof allComponents;

  return (
    <>
      <section className="relative overflow-hidden bg-hero-mesh text-white">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-teal"><Icon name="bolt" className="h-3.5 w-3.5" /> Power Apps Component Framework store</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">Ship better Power Apps. <span className="bg-blue-teal bg-clip-text text-transparent">Buy the components.</span></h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">{allComponents.length} advanced PCF controls and {allPacks.length} industry packs for Canvas apps, Model-driven apps and Power Pages. Drop them in, configure with JSON, go live this week.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/components" className="inline-flex items-center gap-2 rounded-xl bg-blue-teal px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-blue/30 transition hover:brightness-110">Shop components <Icon name="arrow" className="h-4 w-4" /></Link>
              <Link href="/packs" className="rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">Browse industry packs</Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[[allComponents.length, "Components"], [available.length, "Ready to ship"], [3, "Power Platform hosts"]].map(([n, l]) => (
                <div key={l as string} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"><dd className="text-2xl font-extrabold">{n}</dd><dt className="text-[11px] text-slate-300">{l}</dt></div>
              ))}
            </dl>
          </div>
          <div className="relative hidden h-[420px] lg:block">
            {heroPicks.map((c, i) => (
              <Link key={c.slug} href={`/components/${c.slug}`}
                className="absolute w-72 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl transition hover:z-10 hover:-translate-y-2"
                style={{ left: `${i * 26}%`, top: `${[8, 30, 2][i]}%`, transform: `rotate(${[-6, 3, 8][i]}deg)` }}>
                {screensFor(c.slug)[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={screensFor(c.slug)[0].src} alt="" className="h-40 w-full object-cover object-top" />
                ) : <ProductArt c={c} />}
                <div className="p-3"><p className="text-sm font-semibold text-brand-navy">{c.name}</p><p className="truncate text-xs text-slate-500">{c.tagline}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-sky text-brand-blue"><Icon name={p.icon} /></span>
              <div><p className="text-sm font-semibold text-brand-navy">{p.title}</p><p className="text-xs text-slate-500">{p.body}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">Shop by industry</p><h2 className="mt-1 text-3xl font-extrabold text-brand-navy">Find components for your sector</h2></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((ind) => {
            const t = themeFor(ind);
            const n = allComponents.filter((c) => c.industry === ind).length;
            return (
              <Link key={ind} href={`/components?industry=${industrySlug(ind)}`} className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl" style={{ background: `linear-gradient(140deg, ${t.from}, ${t.to})` }}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15"><Icon name={t.icon} className="h-6 w-6" /></span>
                <p className="mt-8 text-lg font-bold leading-tight">{ind}</p>
                <p className="mt-1 text-xs text-white/80">{t.blurb}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: t.accent }}>{n} components <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-end justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">Popular</p><h2 className="mt-1 text-3xl font-extrabold text-brand-navy">Best for any business app</h2></div>
          <Link href="/components" className="hidden items-center gap-1 text-sm font-semibold text-brand-blue hover:underline sm:inline-flex">View all <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{shown.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="overflow-hidden rounded-3xl bg-brand-navy text-white">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Bundles</p>
              <h2 className="mt-2 text-3xl font-extrabold">Industry packs: up to 30 components in one solution</h2>
              <p className="mt-3 text-slate-300">Researched for each sector, built to work together, delivered as a single managed solution with a pack catalogue.</p>
              <Link href="/packs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-brand-navy hover:bg-brand-teal">See all packs <Icon name="arrow" className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {allPacks.map((p) => {
                const t = themeFor(p.industry);
                return (
                  <Link key={p.slug} href={`/packs/${p.slug}`} className="rounded-2xl p-4 transition hover:-translate-y-0.5" style={{ background: `linear-gradient(140deg, ${t.from}, ${t.to})` }}>
                    <div className="flex items-center justify-between"><Icon name={t.icon} className="h-6 w-6" /><span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px]">{p.status === "complete" ? `${packComponents(p).length} components` : "Growing"}</span></div>
                    <p className="mt-6 font-bold">{p.name.replace("Niray ", "")}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">Just landed</p><h2 className="mt-1 text-3xl font-extrabold text-brand-navy">New arrivals</h2></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{newest.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:p-10">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-teal text-white"><Icon name="bolt" className="h-7 w-7" /></span>
          <div className="flex-1"><h2 className="text-2xl font-extrabold text-brand-navy">Need something custom?</h2><p className="mt-1 text-slate-600">We build new PCF controls or tailor any gallery component to your process and data.</p></div>
          <Link href="/custom" className="rounded-xl bg-brand-navy px-6 py-3.5 font-semibold text-white hover:bg-brand-blue">Request custom development</Link>
        </div>
      </section>
    </>
  );
}
