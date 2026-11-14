"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import type { Screen } from "@/lib/catalog";
import { thumbOf } from "@/lib/thumb";

export default function ScreenGallery({ shots, name }: { shots: Screen[]; name: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  // Inside the viewer: tap the picture (or the + button) to magnify it and drag/scroll to pan.
  const [mag, setMag] = useState(false);
  useEffect(() => setMag(false), [i, zoom]);
  const s = shots[i];
  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (mag) setMag(false); else setZoom(false); }
      if (e.key === "ArrowRight") setI((x) => (x + 1) % shots.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [zoom, mag, shots.length]);
  return (
    <div>
      <button type="button" onClick={() => setZoom(true)} className="canvas-dots group relative block w-full overflow-hidden border-y border-line sm:rounded-lg sm:border" aria-label="Enlarge screenshot">
        <div className="flex h-[280px] items-center justify-center sm:h-[440px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt={`${name}: ${s.caption}`} className={`max-h-full ${s.mobile ? "w-auto" : "h-full w-full object-cover object-top"}`} />
        </div>
        <span className="absolute bottom-3 left-3 rounded bg-ink/85 px-2.5 py-1 text-xs text-white">{s.caption} · {i + 1}/{shots.length}</span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-brand-navy opacity-0 shadow transition group-hover:opacity-100"><Icon name="search" className="h-4 w-4" /></span>
      </button>
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-0">
        {shots.map((t, j) => (
          <button key={t.src} type="button" onClick={() => setI(j)} aria-label={`Show screenshot ${j + 1}: ${t.caption}`}
            className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-100 ${j === i ? "border-brand-blue" : "border-transparent opacity-70 hover:opacity-100"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbOf(t.src)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
          </button>
        ))}
      </div>
      {zoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/90" role="dialog" aria-modal="true" aria-label={`${name} screenshots`} onClick={() => (mag ? setMag(false) : setZoom(false))}>
          <div className={`h-full w-full overscroll-contain ${mag ? "overflow-auto" : "flex items-center justify-center p-4"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={`${name}: ${s.caption}`}
              className={mag ? "max-w-none cursor-zoom-out" : "max-h-[88vh] max-w-full cursor-zoom-in rounded-lg shadow-2xl"}
              style={mag ? { width: s.mobile ? "min(220vw, 1100px)" : "min(260vw, 2400px)" } : undefined}
              onClick={(e) => { e.stopPropagation(); setMag(!mag); }} />
          </div>
          <button className="absolute right-16 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 shadow-lg text-2xl font-bold leading-none text-white" aria-label={mag ? "Zoom out" : "Zoom in"} onClick={(e) => { e.stopPropagation(); setMag(!mag); }}>{mag ? "−" : "+"}</button>
          <button className="absolute right-4 top-4 rounded-full bg-ink/75 shadow-lg p-2 text-white" aria-label="Close" onClick={() => setZoom(false)}><Icon name="x" className="h-6 w-6" /></button>
          <button className="absolute left-2 top-1/2 rounded-full bg-ink/75 shadow-lg p-3 text-white" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setI((i - 1 + shots.length) % shots.length); }}><Icon name="arrow" className="h-5 w-5 rotate-180" /></button>
          <button className="absolute right-2 top-1/2 rounded-full bg-ink/75 shadow-lg p-3 text-white" aria-label="Next" onClick={(e) => { e.stopPropagation(); setI((i + 1) % shots.length); }}><Icon name="arrow" className="h-5 w-5" /></button>
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink/70 px-2 py-1 text-sm text-white/90">{s.caption} · {i + 1}/{shots.length}{mag ? "" : " · tap to zoom"}</p>
        </div>
      )}
    </div>
  );
}
