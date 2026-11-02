"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "./Icon";

export type HeroPick = { slug: string; name: string; industry: string; color: string; on: string; src: string };
type Chip = { label: string; href: string; color: string };

/** Home hero: a big search, industry shortcuts, and a showcase of real component screenshots. */
export default function Hero({ picks, chips, total, ready }: { picks: HeroPick[]; chips: Chip[]; total: number; ready: number }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = picks.length;
  const step = (d: number) => { setDir(d); setI((x) => (x + d + n) % n); };
  const jump = (k: number) => { setDir(k >= i ? 1 : -1); setI(k); };
  const go = (e: React.FormEvent) => { e.preventDefault(); router.push(`/components${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); };
  const cur = picks[i] ?? picks[0];

  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-10 lg:grid-cols-[1fr_1.05fr] lg:pb-20 lg:pt-16">
        <div className="min-w-0">
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[4.2rem]">
            Power Apps components, ready to drop in.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            Shop {total} code components for Canvas apps, Model-driven apps and Power Pages. Each one is a managed solution with a user manual.
          </motion.p>

          <motion.form onSubmit={go} role="search" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_10px_30px_-18px_rgba(0,59,92,0.5)] focus-within:border-tile-blue">
            <Icon name="search" className="ml-2 h-5 w-5 shrink-0 text-ink-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search components" placeholder="Try claims, bed board or timetable"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink placeholder:text-ink-faint focus:outline-none" />
            <button className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-tile-blue">Search</button>
          </motion.form>

          <motion.ul initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.04, delayChildren: 0.22 } } }} className="mt-5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <motion.li key={c.label} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }}>
                <Link href={c.href} className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink">
                  <i className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <dl className="mt-10 flex gap-10 border-t border-line pt-6">
            <div><dt className="text-sm text-ink-faint">Components</dt><dd className="text-3xl font-extrabold tracking-tight">{total}</dd></div>
            <div><dt className="text-sm text-ink-faint">Ready today</dt><dd className="text-3xl font-extrabold tracking-tight">{ready}</dd></div>
            <div><dt className="text-sm text-ink-faint">Industry packs</dt><dd className="text-3xl font-extrabold tracking-tight">{chips.length - 1}</dd></div>
          </dl>
        </div>

        {/* the showcase: one screenshot at a time on a clean sheet, two quiet layers behind hint at the rest */}
        <div className="relative mx-auto w-full max-w-[620px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className="relative pt-6 sm:pt-7">
            <div aria-hidden className="absolute inset-x-[12%] top-0 h-24 rounded-[20px] border border-line bg-white/60" />
            <div aria-hidden className="absolute inset-x-[6%] top-3 h-24 rounded-[20px] border border-line bg-white/90 sm:top-3.5" />
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div key={cur.slug} custom={dir}
                initial={{ opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -28 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.35}
                onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 70) step(info.offset.x < 0 ? 1 : -1); }}
                className="relative cursor-grab rounded-[20px] border border-line bg-white p-2.5 shadow-[0_40px_80px_-44px_rgba(0,59,92,0.55)] active:cursor-grabbing sm:p-3.5">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-white">
                  {/* the whole screenshot is shown (contain), so no part of the component is cut off */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cur.src} alt={`${cur.name} screenshot`} draggable={false} className="h-full w-full object-contain" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink-soft"><i className="h-2 w-2 rounded-full" style={{ background: cur.color }} />{cur.industry}</p>
              <Link href={`/components/${cur.slug}`} className="mt-1 block truncate text-xl font-bold tracking-[-0.02em] text-ink hover:text-tile-blue sm:text-2xl">{cur.name}</Link>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => step(-1)} aria-label="Previous component" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink">
                <Icon name="arrow" className="h-4 w-4 rotate-180" />
              </button>
              <button onClick={() => step(1)} aria-label="Next component" className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-tile-blue">
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* one segment per component: filled behind, filling now, empty ahead */}
          <div className="mt-5 flex gap-1.5" role="tablist" aria-label="Featured components">
            {picks.map((p, k) => (
              <button key={p.slug} role="tab" aria-selected={k === i} aria-label={p.name} title={p.name} onClick={() => jump(k)} className="group flex-1 py-2">
                <span className="relative block h-[3px] overflow-hidden rounded-full bg-ink/10 transition-colors group-hover:bg-ink/25">
                  {k < i && <span className="absolute inset-0 bg-ink/45" />}
                  {k === i && <span key={i} className="hero-timer absolute inset-y-0 left-0" onAnimationEnd={() => step(1)}
                    style={{ background: cur.color === "#8DC63F" ? "#3E7A12" : cur.color, animationPlayState: paused || reduce || n < 2 ? "paused" : "running" }} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
