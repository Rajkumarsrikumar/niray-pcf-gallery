"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "./Icon";

export type HeroPick = { slug: string; name: string; industry: string; color: string; on: string; src: string; thumb: string };
type Chip = { label: string; href: string; color: string };

/** Home hero: a big search, industry shortcuts, and a deck of real component screenshots that deals itself. */
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
  const order = picks.map((_, k) => picks[(i + k) % n]).slice(0, 3);
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

        {/* the deck: real screenshots in a browser frame, dealt one after another; the glow behind takes the colour of each industry */}
        <div className="relative mx-auto w-full max-w-[620px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <motion.div aria-hidden animate={{ backgroundColor: cur.color }} transition={{ duration: 0.8 }}
            className="pointer-events-none absolute -inset-x-8 top-4 bottom-20 rounded-[45%] opacity-40 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -inset-10 bg-[radial-gradient(rgba(0,59,92,0.16)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

          <div className="relative pt-12 sm:pt-14">
            {/* an invisible copy of a card in normal flow, so the deck's height always matches its cards at every width */}
            <div aria-hidden className="invisible rounded-2xl border">
              <div className="px-3 py-2"><span className="block py-1 text-[11px]">&nbsp;</span></div>
              <div className="aspect-[4/2.6] w-full" />
              <div className="flex items-center px-4 py-3 sm:px-5 sm:py-4"><span className="block h-9 sm:h-[46px]" /></div>
            </div>
            <AnimatePresence initial={false} custom={dir}>
              {order.slice().reverse().map((p) => {
                const depth = order.indexOf(p);
                const tint = p.color === "#8DC63F" ? "#3E7A12" : p.color;
                return (
                  <motion.div key={p.slug} layout custom={dir}
                    initial={{ opacity: 0, y: 46, scale: 0.86 }}
                    animate={{ opacity: depth === 2 ? 0.75 : 1, y: depth * -26, x: depth === 0 ? 0 : depth % 2 ? 18 : -18, scale: 1 - depth * 0.06, rotate: depth === 0 ? 0 : depth % 2 ? 3.5 : -3.5 }}
                    exit={{ opacity: 0, x: dir * -160, rotate: dir * -10, transition: { duration: 0.38 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    drag={depth === 0 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6}
                    onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80) step(info.offset.x < 0 ? 1 : -1); }}
                    style={{ zIndex: 10 - depth, transformOrigin: "50% 100%" }}
                    className="absolute inset-x-0 bottom-0 cursor-grab overflow-hidden rounded-2xl border border-line bg-white shadow-[0_34px_70px_-30px_rgba(0,59,92,0.6)] active:cursor-grabbing">
                    {/* browser frame */}
                    <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2">
                      <span className="flex gap-1.5" aria-hidden><i className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><i className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><i className="h-2.5 w-2.5 rounded-full bg-[#28C840]" /></span>
                      <span className="min-w-0 flex-1 truncate rounded-md border border-line bg-white px-2.5 py-1 text-[11px] text-ink-faint">niraypcfgallery.com/components/<b className="font-semibold text-ink-soft">{p.slug}</b></span>
                      <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline" style={{ background: p.color, color: p.on }}>{p.industry.split(" & ")[0]}</span>
                    </div>
                    <div className="aspect-[4/2.6] w-full bg-white p-2.5 sm:p-3">
                      {/* the whole screenshot is shown (contain), so no part of the component is cut off; cards further back stay blank so they read as a clean stack */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt={depth === 0 ? `${p.name} screenshot` : ""} draggable={false} className={`h-full w-full object-contain ${depth === 0 ? "" : "invisible"}`} />
                    </div>
                    <div className="flex items-center gap-3 border-t border-line px-4 py-3 sm:px-5 sm:py-4">
                      <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium" style={{ color: tint }}>{p.industry}</span>
                        <span className="block truncate text-base font-bold sm:text-lg">{p.name}</span>
                      </span>
                      {depth === 0 && <Link href={`/components/${p.slug}`} className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-tile-blue">View</Link>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* counter, timer bar and arrows */}
          <div className="relative mt-6 flex items-center gap-3">
            <button onClick={() => step(-1)} aria-label="Previous component" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink">
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
            </button>
            <span className="shrink-0 text-sm font-bold tabular-nums text-ink">{String(i + 1).padStart(2, "0")}<span className="font-medium text-ink-faint"> / {String(n).padStart(2, "0")}</span></span>
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
              <span key={i} className="hero-timer absolute inset-y-0 left-0 rounded-full"
                onAnimationEnd={() => step(1)}
                style={{ background: cur.color, animationPlayState: paused || reduce || n < 2 ? "paused" : "running", width: reduce ? "100%" : undefined }} />
            </span>
            <button onClick={() => step(1)} aria-label="Next component" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink">
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </div>

          {/* every featured component, as a thumbnail strip */}
          <div className="relative mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" role="tablist" aria-label="Featured components">
            {picks.map((p, k) => (
              <button key={p.slug} role="tab" aria-selected={k === i} aria-label={p.name} title={p.name} onClick={() => jump(k)}
                className={`aspect-[4/3] overflow-hidden rounded-lg border bg-white p-0.5 transition-all ${k === i ? "-translate-y-0.5 shadow-md" : "border-line opacity-60 hover:opacity-100"}`}
                style={k === i ? { borderColor: p.color, boxShadow: `0 0 0 2px ${p.color}` } : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
