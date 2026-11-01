export const metadata = { title: "Pricing | Niray PCF Gallery" };

const tiers = [
  { name: "Single component", body: "One PCF control with managed and unmanaged solutions, user manual and 12 months of updates." },
  { name: "Industry pack", body: "Every component in one industry pack, delivered as a single solution with a pack catalogue." },
  { name: "All-access", body: "Every component and pack in the gallery, including new releases, for one year." },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-navy">Pricing</h1>
      <p className="mt-2 text-slate-600">Prices are being finalised. Email <a className="text-brand-blue hover:underline" href="mailto:info@nirayitsolutions.com">info@nirayitsolutions.com</a> for early access.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-navy">{t.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.body}</p>
            <p className="mt-6 text-2xl font-bold text-slate-400">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
