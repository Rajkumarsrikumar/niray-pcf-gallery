import Link from "next/link";
import Gallery from "./Gallery";
import { allComponents, allPacks, industries } from "@/lib/catalog";

export default function Home() {
  return (
    <>
      <section className="bg-hero-mesh text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-teal">Power Apps Component Framework</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Production-ready PCF controls for Power Apps and Power Pages</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-200">
            {allComponents.length}+ advanced, mobile-friendly code components with user manuals, managed and unmanaged solutions, built for Canvas, Model-driven and Power Pages.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#gallery" className="rounded-lg bg-blue-teal px-5 py-3 font-semibold text-white shadow">Browse components</Link>
            <Link href="/packs" className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Industry packs</Link>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 text-center">
            <div><dt className="text-xs text-slate-300">Components</dt><dd className="text-3xl font-bold">{allComponents.length}</dd></div>
            <div><dt className="text-xs text-slate-300">Industry packs</dt><dd className="text-3xl font-bold">{allPacks.length}</dd></div>
            <div><dt className="text-xs text-slate-300">Hosts</dt><dd className="text-3xl font-bold">3</dd></div>
          </dl>
        </div>
      </section>
      <section id="gallery" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-brand-navy sm:text-3xl">Component gallery</h2>
        <Gallery items={allComponents} industries={industries} />
      </section>
    </>
  );
}
