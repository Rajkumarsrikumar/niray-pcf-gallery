import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "../../AddToCart";
import { Comments, EngageBar } from "../../Engagement";
import Icon from "../../Icon";
import ProductArt from "../../ProductArt";
import ProductCard from "../../ProductCard";
import ScreenGallery from "../../ScreenGallery";
import FreeDownload from "./FreeDownload";
import Sections from "./Sections";
import delivery from "@/data/delivery.json";
import { componentKeywords } from "@/lib/seo";
import { CONTACT, HEALTH_NOTICE, PRICE, formatPrice, allComponents, getComponent, isAvailable, packForComponent, screensFor, themeFor } from "@/lib/catalog";

export function generateStaticParams() {
  return allComponents.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = getComponent(params.slug);
  if (!c) return {};
  const shot = screensFor(c.slug).find((x) => !x.mobile) ?? screensFor(c.slug)[0];
  return {
    title: `${c.name} – PCF control for Power Apps & Power Pages | Niray`,
    description: `${c.tagline.replace(/\.\s*$/, "")}. ${c.name} is a ready-to-import PCF control for ${c.industry} Power Apps (Canvas, Model-driven) and Power Pages, with managed solution and user manual.`,
    keywords: componentKeywords(c),
    alternates: { canonical: `/components/${c.slug}` },
    openGraph: { title: `${c.name} – Power Apps PCF component`, description: c.tagline, url: `/components/${c.slug}`, ...(shot ? { images: [{ url: shot.src }] } : {}) },
  };
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
    applicationCategory: "BusinessApplication", keywords: componentKeywords(c).join(", "), operatingSystem: "Microsoft Power Platform", softwareVersion: c.componentVersion,
    url: `https://niraypcfgallery.com/components/${c.slug}`,
    ...(shots[0] ? { image: shots.map((s) => new URL(s.src, "https://niraypcfgallery.com").href) } : {}),
    publisher: { "@type": "Organization", name: "Niray IT Solutions Pte. Ltd.", url: "https://www.nirayitsolutions.com" },
    ...(isAvailable(c) ? { offers: { "@type": "Offer", price: PRICE.component, priceCurrency: "SGD", availability: "https://schema.org/InStock", url: `https://niraypcfgallery.com/components/${c.slug}` } } : {}),
  };
  const crumbsLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://niraypcfgallery.com/" },
      { "@type": "ListItem", position: 2, name: "Components", item: "https://niraypcfgallery.com/components" },
      { "@type": "ListItem", position: 3, name: c.name },
    ],
  };
  const specs: [string, string | null | undefined][] = [
    ["Schema name", c.schemaName], ["Component version", c.componentVersion], ["Solution version", c.solutionVersion ?? "Added in next release"],
    ["Control type", c.controlType], ["React", c.react], ["Complexity", c.complexity], ["Category", c.category], ["Built", c.dateBuilt],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, crumbsLd]) }} />
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-ink-faint" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link><span>/</span>
        <Link href="/components" className="hover:text-ink">Components</Link><span>/</span>
        <span className="text-ink">{c.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        <div className="-mx-4 min-w-0 sm:mx-0">
          {shots.length ? <ScreenGallery shots={shots} name={c.name} /> : <div className="overflow-hidden sm:rounded-lg"><ProductArt c={c} size="hero" /></div>}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded px-2.5 py-1 text-xs font-semibold" style={{ background: t.color, color: t.on }}>{c.industry}</span>
            <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-line">{isAvailable(c) ? "Ready to download" : "Coming soon: built and tested"}</span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">{c.name}</h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{c.tagline}</p>
          <div className="mt-4"><EngageBar kind="component" slug={c.slug} /></div>
          {pack && <p className="mt-2 text-sm text-ink-faint">Also in the <Link href={`/packs/${pack.slug}`} className="font-semibold text-tile-blue hover:underline">{pack.name}</Link></p>}

          <div className="-mx-4 mt-6 border-y border-ink/15 bg-white p-5 sm:mx-0 sm:rounded-lg sm:border sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-sm text-ink-faint">Licence price</p><p className="text-3xl font-extrabold text-ink">{formatPrice(PRICE.component)}</p></div>
              <p className="text-right text-xs text-ink-faint">One-time licence<br />Emailed to you after payment</p>
            </div>
            <div className="mt-5 space-y-2.5">
              <AddToCart item={{ slug: c.slug, name: c.name, kind: "component" }} />
              <a href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Demo request: ${c.name}`)}`} className="flex w-full items-center justify-center rounded-lg border border-ink/20 px-5 py-3.5 font-semibold text-ink hover:border-ink">Request a demo</a>
              <Link href="/custom" className="block pt-1 text-center text-sm font-medium text-tile-blue hover:underline">Need it customised? Request custom development</Link>
            </div>
            {c.slug in delivery && <FreeDownload slug={c.slug} name={c.name} />}
            <ul className="mt-5 grid gap-2 border-t border-line pt-5 text-sm text-ink-soft sm:grid-cols-2">
              {["Managed solution", "User manual (Word)", "Canvas, Model-driven, Power Pages", c.mobileResponsive ? "Works on phones" : "Desktop layout"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-tile-leaf" />{x}</li>
              ))}
            </ul>
          </div>
          {health && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{HEALTH_NOTICE}</p>}
        </div>
      </div>

      <div className="-mx-4 mt-10 sm:mx-0">
        <Sections
          initiallyOpen={["features"]}
          sections={[
            {
              id: "features", title: "Key features", summary: `${c.features.length} features`,
              body: (
                <ul className="grid gap-x-8 gap-y-2.5 md:grid-cols-2">
                  {c.features.map((f) => <li key={f} className="flex gap-2.5 leading-relaxed text-ink"><span className="mt-2 h-2 w-2 shrink-0 rounded-sm" style={{ background: t.color }} />{f}</li>)}
                </ul>
              ),
            },
            { id: "description", title: "Full description", summary: "What it does, in detail", body: <p className="max-w-3xl leading-relaxed text-ink-soft">{c.description}</p> },
            {
              id: "specs", title: "Technical specs", summary: `${c.schemaName} · v${c.componentVersion}`,
              body: (
                <dl className="grid gap-x-10 text-sm md:grid-cols-2">
                  {specs.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5"><dt className="text-ink-faint">{k}</dt><dd className="break-all text-right font-medium text-ink">{v ?? "–"}</dd></div>)}
                </dl>
              ),
            },
            {
              id: "install", title: "How to install", summary: "Canvas, Model-driven and Power Pages",
              body: (
                <ul className="max-w-3xl space-y-3 text-ink-soft">
                  <li><b className="text-ink">What you get:</b> a managed solution to import into your environment, and a user manual.</li>
                  <li><b className="text-ink">Canvas apps:</b> turn on &quot;Allow publishing of canvas apps with code components&quot;, import the solution, then Insert, Get more components, Code.</li>
                  <li><b className="text-ink">Model-driven apps:</b> in the form designer select the field, then Components, + Component.</li>
                  <li><b className="text-ink">Power Pages:</b> enable the code component on a form field in design studio, or use Liquid: <code className="break-all rounded bg-paper px-1">{`{% codecomponent name:${c.schemaName} /%}`}</code></li>
                </ul>
              ),
            },
            {
              id: "tags", title: "Tags", summary: `${c.tags.length} tags`,
              body: <div className="flex flex-wrap gap-1.5">{c.tags.map((tag) => <Link key={tag} href={`/components?q=${encodeURIComponent(tag)}`} className="rounded bg-paper px-2.5 py-1 text-sm text-ink-soft ring-1 ring-line hover:text-ink">{tag}</Link>)}</div>,
            },
          ]}
        />
      </div>

      <Comments kind="component" slug={c.slug} title={c.name} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-ink">More for {c.industry}</h2>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} c={r} />)}</div>
        </section>
      )}
    </div>
  );
}
