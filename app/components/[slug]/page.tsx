import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "../../AddToCart";
import Icon from "../../Icon";
import ProductArt from "../../ProductArt";
import ProductCard from "../../ProductCard";
import ScreenGallery from "../../ScreenGallery";
import { CONTACT, HEALTH_NOTICE, allComponents, getComponent, isAvailable, packForComponent, screensFor, themeFor } from "@/lib/catalog";

export function generateStaticParams() {
  return allComponents.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = getComponent(params.slug);
  return c ? { title: `${c.name} – Power Apps PCF component | Niray IT Solutions`, description: c.tagline, keywords: c.tags } : {};
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const c = getComponent(params.slug);
  if (!c) notFound();
  const t = themeFor(c.industry);
  const pack = packForComponent(c);
  const related = allComponents.filter((x) => x.industry === c.industry && x.slug !== c.slug).slice(0, 4);
  const health = c.industry.startsWith("Healthcare");
  const shots = screensFor(c.slug);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: c.name, description: c.tagline,
    applicationCategory: "BusinessApplication", operatingSystem: "Microsoft Power Platform", softwareVersion: c.componentVersion,
    publisher: { "@type": "Organization", name: "Niray IT Solutions Pte. Ltd.", url: "https://www.nirayitsolutions.com" },
  };
  const specs: [string, string | null | undefined][] = [
    ["Schema name", c.schemaName], ["Component version", c.componentVersion], ["Solution version", c.solutionVersion ?? "Added in next release"],
    ["Control type", c.controlType], ["React", c.react], ["Complexity", c.complexity], ["Category", c.category], ["Built", c.dateBuilt],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-blue">Home</Link><span>/</span>
        <Link href="/components" className="hover:text-brand-blue">Shop</Link><span>/</span>
        <span className="text-brand-navy">{c.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          {shots.length ? <ScreenGallery shots={shots} name={c.name} /> : <div className="overflow-hidden rounded-3xl shadow-xl"><ProductArt c={c} size="hero" /></div>}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xl font-extrabold text-brand-navy">{c.screenshotCount}</p>real screenshots</div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xl font-extrabold text-brand-navy">{c.features.length}+</p>key features</div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xl font-extrabold text-brand-navy">3</p>hosts supported</div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: t.to }}>{c.industry}</span>
            {isAvailable(c) ? <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">● In stock: ready to download</span>
              : <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Coming soon: built and tested</span>}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">{c.name}</h1>
          <p className="mt-3 text-lg text-slate-600">{c.tagline}</p>
          {pack && <p className="mt-2 text-sm text-slate-500">Also in the <Link href={`/packs/${pack.slug}`} className="font-semibold text-brand-blue hover:underline">{pack.name}</Link></p>}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div><p className="text-sm text-slate-500">Licence price</p><p className="text-3xl font-extrabold text-brand-navy">{c.price ? `$${c.price}` : "On request"}</p></div>
              <p className="text-right text-xs text-slate-500">One-time licence<br />12 months of updates</p>
            </div>
            <div className="mt-5 space-y-2.5">
              <AddToCart item={{ slug: c.slug, name: c.name, kind: "component" }} />
              <a href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Demo request: ${c.name}`)}`} className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3.5 font-semibold text-brand-navy hover:border-brand-blue">Request a demo</a>
              <Link href="/custom" className="block text-center text-sm font-medium text-brand-blue hover:underline">Need it customised? Request custom development</Link>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {["Managed + unmanaged solution", "Branded user manual (DOCX)", "Canvas, Model-driven, Power Pages", c.mobileResponsive ? "Mobile responsive" : "Desktop layout"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-brand-green" />{x}</li>
              ))}
            </ul>
          </div>

          {health && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{HEALTH_NOTICE}</p>}

          <section className="mt-8">
            <h2 className="text-lg font-bold text-brand-navy">Key features</h2>
            <ul className="mt-3 space-y-2">
              {c.features.map((f) => <li key={f} className="flex gap-2.5 text-slate-700"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: t.to }} />{f}</li>)}
            </ul>
          </section>

          <details className="group mt-6 rounded-2xl border border-slate-200 bg-white p-5" open>
            <summary className="cursor-pointer list-none font-bold text-brand-navy">Full description</summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.description}</p>
          </details>
          <details className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer list-none font-bold text-brand-navy">Technical specs</summary>
            <dl className="mt-3 divide-y divide-slate-100 text-sm">
              {specs.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-slate-500">{k}</dt><dd className="break-all text-right font-medium text-slate-800">{v ?? "–"}</dd></div>)}
            </dl>
          </details>
          <details className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer list-none font-bold text-brand-navy">How to install</summary>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><b>Which package:</b> unmanaged in development, managed in test and production.</li>
              <li><b>Canvas apps:</b> turn on "Allow publishing of canvas apps with code components", import the solution, then Insert → Get more components → Code.</li>
              <li><b>Model-driven apps:</b> in the form designer select the field, then Components → + Component.</li>
              <li><b>Power Pages:</b> enable the code component on a form field in design studio, or use Liquid: <code className="break-all rounded bg-slate-100 px-1">{`{% codecomponent name:${c.schemaName} /%}`}</code></li>
            </ul>
          </details>
          <div className="mt-5 flex flex-wrap gap-1.5">{c.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">#{tag}</span>)}</div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-extrabold text-brand-navy">You may also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} c={r} />)}</div>
        </section>
      )}
    </div>
  );
}
