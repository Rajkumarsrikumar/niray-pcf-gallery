import Link from "next/link";
import type { Component } from "@/lib/catalog";

export default function ComponentCard({ c }: { c: Component }) {
  return (
    <Link href={`/components/${c.slug}`} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs">
        <span className="rounded-full bg-brand-sky px-2 py-0.5 font-medium text-brand-navy">{c.industry}</span>
        {!c.available && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">Coming soon</span>}
      </div>
      <h3 className="font-semibold text-brand-navy group-hover:text-brand-blue">{c.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{c.summary}</p>
      <div className="mt-auto flex flex-wrap gap-1 pt-4">
        {c.hosts.map((h) => (
          <span key={h} className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500">{h}</span>
        ))}
      </div>
    </Link>
  );
}
