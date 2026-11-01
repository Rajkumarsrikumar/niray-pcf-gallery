"use client";
import Link from "next/link";
import { useState } from "react";
import { themeFor, type Component, type Screen } from "@/lib/catalog";

type Pick = { c: Component; shot: Screen };

/** Hero: a miniature maker studio. Pick a component in the tree, it lands on the canvas with selection handles and its properties. */
export default function StudioCanvas({ picks }: { picks: Pick[] }) {
  const [i, setI] = useState(0);
  const { c, shot } = picks[i];
  const t = themeFor(c.industry);
  const handle = "absolute h-2.5 w-2.5 border-2 border-tile-blue bg-white";
  return (
    <div className="overflow-hidden rounded-xl border border-ink/15 bg-white shadow-[0_24px_60px_-28px_rgba(16,42,67,0.45)]">
      <div className="flex items-center gap-3 border-b border-line bg-ink px-4 py-2 text-xs text-white/80">
        <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-white/30" /><i className="h-2.5 w-2.5 rounded-full bg-white/30" /><i className="h-2.5 w-2.5 rounded-full bg-white/30" /></span>
        <span className="truncate">Your app › Screen1 › {c.component}1</span>
      </div>
      <div className="grid md:grid-cols-[170px_1fr_190px]">
        {/* tree view */}
        <nav aria-label="Components on this screen" className="flex gap-1 overflow-x-auto border-b border-line p-2 md:block md:space-y-0.5 md:border-b-0 md:border-r">
          <p className="hidden px-2 pb-1 pt-1 text-xs font-semibold text-ink-faint md:block">Tree view</p>
          {picks.map((p, j) => (
            <button key={p.c.slug} type="button" onClick={() => setI(j)} aria-pressed={j === i}
              className={`flex shrink-0 items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] md:w-full ${j === i ? "bg-tile-blue/10 font-semibold text-tile-blue" : "text-ink-soft hover:bg-paper"}`}>
              <i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: themeFor(p.c.industry).color }} />
              <span className="truncate">{p.c.component}1</span>
            </button>
          ))}
        </nav>
        {/* canvas */}
        <div className="canvas-dots relative flex min-h-[260px] items-center justify-center p-5 sm:min-h-[330px] sm:p-8">
          <div className="relative w-full max-w-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={shot.src} src={shot.src} alt={`${c.name} on a Power Apps screen`} className="block max-h-[280px] w-full rounded-sm bg-white object-cover object-top shadow-md" />
            <span className="pointer-events-none absolute -inset-1.5 border-2 border-tile-blue" />
            <span className={`${handle} -left-[11px] -top-[11px]`} /><span className={`${handle} -right-[11px] -top-[11px]`} />
            <span className={`${handle} -bottom-[11px] -left-[11px]`} /><span className={`${handle} -bottom-[11px] -right-[11px]`} />
            <span className={`${handle} -top-[11px] left-1/2 -ml-[5px]`} /><span className={`${handle} -bottom-[11px] left-1/2 -ml-[5px]`} />
            <span className="absolute -top-8 left-0 rounded-sm bg-tile-blue px-2 py-0.5 text-xs font-semibold text-white">{c.component}1</span>
          </div>
        </div>
        {/* properties */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line p-4 text-[13px] md:block md:space-y-3 md:border-l md:border-t-0">
          <p className="col-span-2 text-xs font-semibold text-ink-faint">Properties</p>
          <div><dt className="text-ink-faint">Industry</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />{c.industry}</dd></div>
          <div><dt className="text-ink-faint">Runs in</dt><dd className="mt-0.5 font-medium">Canvas, Model-driven, Power Pages</dd></div>
          <div><dt className="text-ink-faint">Mobile</dt><dd className="mt-0.5 font-medium">{c.mobileResponsive ? "Responsive to 320 px" : "Desktop"}</dd></div>
          <div><dt className="text-ink-faint">Schema</dt><dd className="mt-0.5 break-all font-medium">{c.schemaName}</dd></div>
          <Link href={`/components/${c.slug}`} className="col-span-2 mt-1 inline-block rounded bg-ink px-3 py-2 text-center font-semibold text-white hover:bg-tile-blue md:w-full">Open {c.name}</Link>
        </dl>
      </div>
    </div>
  );
}
