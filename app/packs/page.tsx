import Link from "next/link";
import { allPacks } from "@/lib/catalog";

export const metadata = { title: "Industry packs | Niray PCF Gallery" };

export default function Packs() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-navy">Industry packs</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Sets of up to 30 components researched and built for one industry, sold as a single solution.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {allPacks.map((p) => (
          <Link key={p.slug} href={`/packs/${p.slug}`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md">
            <p className="text-xs font-medium text-brand-blue">{p.industry}</p>
            <h2 className="mt-1 text-xl font-semibold text-brand-navy">{p.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.components.length} components · {p.complete ? "Complete" : "In progress"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
