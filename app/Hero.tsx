"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "./Icon";

export type HeroPick = { slug: string; name: string; industry: string; color: string; on: string; src: string };
type Chip = { label: string; href: string; color: string };

/** Home hero: a big search, industry shortcuts, and a deck of real component screenshots that deals itself. */
export default function Hero({ picks, chips, total, ready }: { picks: HeroPick[]; chips: Chip[]; total: number; ready: number }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || reduce || picks.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % picks.length), 4200);
    return () => clearInterval(t);
  }, [paused, reduce, picks.length]);
  const go = (e: React.FormEvent) => { e.preventDefault(); router.push(`/components${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); };
  const order = picks.map((_, k) => picks[(i + k) % picks.length]).slice(0, 3);

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

        {/* the deck */}
        <div className="relative mx-auto w-full max-w-[600px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className="relative aspect-[4/3.3]">
            <AnimatePresence initial={false}>
              {order.slice().reverse().map((p) => {
                const depth = order.indexOf(p);
                return (
                  <motion.div key={p.slug} layout
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: depth === 2 ? 0.5 : 1, y: depth * -22, scale: 1 - depth * 0.06, rotate: depth === 0 ? 0 : depth % 2 ? 2.5 : -2.5 }}
                    exit={{ opacity: 0, x: -120, rotate: -8, transition: { duration: 0.35 } }}
                    drag={depth === 0 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6}
                    onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80) setI((x) => (x + 1) % picks.length); }}
                    style={{ zIndex: 10 - depth, transformOrigin: "50% 100%" }}
                    className="absolute inset-x-0 bottom-0 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-30px_rgba(0,59,92,0.55)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={depth === 0 ? `${p.name} screenshot` : ""} draggable={false} className="aspect-[4/2.75] w-full bg-paper object-cover object-top" />
                    <div className="flex items-center gap-3 border-t border-line px-5 py-4">
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium" style={{ color: p.color === "#8DC63F" ? "#3E7A12" : p.color }}>{p.industry}</span>
                        <span className="block truncate text-lg font-bold">{p.name}</span>
                      </span>
                      {depth === 0 && <Link href={`/components/${p.slug}`} className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-tile-blue">View</Link>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Featured components">
            {picks.map((p, k) => (
              <button key={p.slug} role="tab" aria-selected={k === i} aria-label={p.name} onClick={() => setI(k)}
                className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-ink" : "w-2 bg-ink/20 hover:bg-ink/40"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
