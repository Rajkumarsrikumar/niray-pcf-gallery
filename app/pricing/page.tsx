import Link from "next/link";
import Icon from "../Icon";

export const metadata = { title: "Pricing | Niray PCF Gallery" };

const tiers = [
  { name: "Single component", body: "One PCF control for your organisation.", items: ["Managed + unmanaged solution", "User manual", "12 months of updates"], cta: "/components" },
  { name: "Industry pack", body: "Every component in one industry pack.", items: ["Up to 30 components", "One combined solution", "Pack catalogue + manuals"], cta: "/packs", featured: true },
  { name: "All-access", body: "The full library, including new releases.", items: ["Every component and pack", "New components as they ship", "Priority email support"], cta: "/components" },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-navy sm:text-5xl">Simple licensing</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Final prices are being set. Add items to your basket to request a quote today.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`relative rounded-3xl p-7 ${t.featured ? "bg-brand-navy text-white shadow-2xl md:-translate-y-3" : "border border-slate-200 bg-white shadow-sm"}`}>
            {t.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-teal px-3 py-1 text-xs font-bold text-brand-navy">Most popular</span>}
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className={`mt-1 text-sm ${t.featured ? "text-slate-300" : "text-slate-500"}`}>{t.body}</p>
            <p className="mt-6 text-3xl font-extrabold">On request</p>
            <ul className="mt-6 space-y-2.5 text-sm">{t.items.map((i) => <li key={i} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-brand-green" />{i}</li>)}</ul>
            <Link href={t.cta} className={`mt-8 block rounded-xl py-3 text-center font-semibold ${t.featured ? "bg-white text-brand-navy hover:bg-brand-teal" : "bg-brand-navy text-white hover:bg-brand-blue"}`}>Browse</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
