import Link from "next/link";
import { notFound } from "next/navigation";
import ComponentCard from "../../ComponentCard";
import { allPacks, getPack, packComponents } from "@/lib/catalog";

export function generateStaticParams() {
  return allPacks.map((p) => ({ slug: p.slug }));
}

export default function PackPage({ params }: { params: { slug: string } }) {
  const p = getPack(params.slug);
  if (!p) notFound();
  const items = packComponents(p);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/packs" className="text-sm text-brand-blue hover:underline">← All packs</Link>
      <h1 className="mt-3 text-3xl font-extrabold text-brand-navy">{p.name}</h1>
      <p className="mt-2 text-slate-600">{items.length} components for {p.industry}{p.complete ? "" : " (pack still being built)"}.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((c) => <ComponentCard key={c.slug} c={c} />)}</div>
    </div>
  );
}
