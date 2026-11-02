import Link from "next/link";

export const metadata = { title: "How to install | Niray PCF Gallery", description: "How to import a Niray PCF managed solution and add the code component to Canvas apps, Model-driven apps and Power Pages.", alternates: { canonical: "/install" } };

const steps = [
  { h: "Import the managed solution", b: "Import the managed solution you received into your environment from Solutions → Import solution." },
  { h: "Canvas apps", b: "Turn on \"Allow publishing of canvas apps with code components\" in the environment, import the solution, then go to Insert → Get more components → Code." },
  { h: "Model-driven apps", b: "In the form designer, select the field, then Components → + Component, and choose the Niray control." },
  { h: "Power Pages", b: "Enable the code component on a form field in design studio, or place it with Liquid: {% codecomponent name:<schemaName> ... /%}" },
  { h: "Configure", b: "Each component takes JSON configuration and labels as properties. The user manual lists every property with sample JSON." },
];

export default function Install() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
            <h1 className="mt-1 text-3xl font-extrabold text-brand-navy sm:text-4xl">How to install a Niray PCF component</h1>
      <p className="mt-3 text-slate-600">Every component ships the same way, so these steps work for all of them. React 16.14.0 is bundled inside each control, which is why they also run in Power Pages.</p>
      <ol className="mt-10 space-y-6">
        {steps.map((s, i) => (
          <li key={s.h} className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-white">{i + 1}</span>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-brand-navy">{s.h}</h2><p className="mt-1 break-words text-slate-600">{s.b}</p></div>
          </li>
        ))}
      </ol>
      <Link href="/components" className="mt-10 inline-block rounded-xl bg-brand-navy px-6 py-3 font-semibold text-white hover:bg-brand-blue">Browse components</Link>
    </div>
  );
}
