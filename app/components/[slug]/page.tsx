import Link from "next/link";
import { notFound } from "next/navigation";
import { allComponents, getComponent } from "@/lib/catalog";

export function generateStaticParams() {
  return allComponents.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = getComponent(params.slug);
  return c ? { title: `${c.title} PCF control | Niray PCF Gallery`, description: c.summary.slice(0, 160) } : {};
}

export default function ComponentPage({ params }: { params: { slug: string } }) {
  const c = getComponent(params.slug);
  if (!c) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/#gallery" className="text-sm text-brand-blue hover:underline">← All components</Link>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-brand-sky px-2 py-0.5 font-medium text-brand-navy">{c.industry}</span>
        <span className="rounded-full bg-brand-sky px-2 py-0.5 text-brand-navy">{c.complexity}</span>
        {c.mobile && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">Mobile responsive</span>}
      </div>
      <h1 className="mt-3 text-3xl font-extrabold text-brand-navy sm:text-4xl">{c.title}</h1>
      {c.pack && <p className="mt-1 text-sm text-slate-500">Part of the {c.pack}</p>}
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <h2 className="mb-2 font-semibold text-brand-navy">What it does</h2>
          <p className="whitespace-pre-line leading-relaxed text-slate-700">{c.summary}</p>
          <h2 className="mb-2 mt-8 font-semibold text-brand-navy">Highlights</h2>
          <div className="flex flex-wrap gap-2">
            {c.tags.map((t) => <span key={t} className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">{t}</span>)}
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Works in</p>
          <ul className="mt-1 space-y-1 text-sm font-medium text-slate-800">{c.hosts.map((h) => <li key={h}>✓ {h}</li>)}</ul>
          <p className="mt-4 text-sm text-slate-500">Includes managed + unmanaged solution, user manual{c.screenshots ? ` (${c.screenshots} screenshots)` : ""}.</p>
          <button disabled className="mt-5 w-full cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2.5 font-semibold text-slate-500">
            {c.available ? "Pricing coming soon" : "Coming soon"}
          </button>
          <a href={`mailto:info@nirayitsolutions.com?subject=${encodeURIComponent(`PCF enquiry: ${c.title}`)}`} className="mt-2 block text-center text-sm text-brand-blue hover:underline">Ask about this component</a>
        </aside>
      </div>
    </div>
  );
}
