"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";

const nav = [
  { href: "/components", label: "Shop all" },
  { href: "/packs", label: "Industry packs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/custom", label: "Custom development" },
];

export default function Header() {
  const { items, setOpen } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
    const submit = (e: React.FormEvent) => { e.preventDefault(); router.push(`/components${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);  };
  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-white/85">Every component comes as a managed solution with a user manual, emailed to you as soon as payment is received.</div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
          <Link href="/" className="shrink-0" aria-label="Niray PCF Gallery home"><Logo /></Link>
          <form onSubmit={submit} className="relative hidden flex-1 md:block" role="search">
            <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components: claims, bed board, timetable" aria-label="Search components"
              className="w-full rounded-full border border-line bg-paper py-2.5 pl-10 pr-4 text-sm focus:border-tile-blue focus:bg-white focus:outline-none" />
          </form>
          <nav className="hidden items-center gap-5 text-sm font-medium text-ink-soft lg:flex">
            {nav.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-ink">{n.label}</Link>)}
          </nav>
          <Link href="/components" aria-label="Search components" className="ml-auto rounded-full p-2 text-brand-navy hover:bg-slate-100 md:hidden"><Icon name="search" className="h-6 w-6" /></Link>
          <button onClick={() => setOpen(true)} className="relative rounded-full p-2 text-brand-navy hover:bg-slate-100 md:ml-0" aria-label={`Basket, ${items.length} items`}>
            <Icon name="cart" className="h-6 w-6" />
            <AnimatePresence>{items.length > 0 && <motion.span key={items.length} initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-tile-blue px-1 text-[11px] font-bold text-white">{items.length}</motion.span>}</AnimatePresence>
          </button>
        </div>
      </header>
      <BottomNav />
      <CartDrawer />
    </>
  );
}

function CartDrawer() {
  const { items, open, setOpen, remove } = useCart();
  return (
    <AnimatePresence>
    {open && (
    <motion.div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your basket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#003B5C]/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-brand-navy">Your basket ({items.length})</h2>
          <button onClick={() => setOpen(false)} aria-label="Close basket" className="rounded-full p-1.5 hover:bg-slate-100"><Icon name="x" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-500"><Icon name="cart" className="mx-auto mb-3 h-10 w-10 text-slate-300" />Your basket is empty.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((i) => (
                <li key={i.slug} className="flex items-center gap-3 py-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-sky text-brand-blue"><Icon name={i.kind === "pack" ? "layers" : "box"} /></span>
                  <div className="min-w-0 flex-1">
                    <Link href={i.kind === "pack" ? `/packs/${i.slug}` : `/components/${i.slug}`} onClick={() => setOpen(false)} className="block truncate font-medium text-brand-navy hover:underline">{i.name}</Link>
                    <p className="text-xs text-slate-500">{i.kind === "pack" ? "Industry pack" : "PCF component"} · Price on request</p>
                  </div>
                  <button onClick={() => remove(i.slug)} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-5">
            <Link href="/checkout" onClick={() => setOpen(false)} className="block w-full rounded-xl bg-ink py-3.5 text-center font-semibold text-white hover:bg-brand-blue">Continue to checkout</Link>
            <button onClick={() => setOpen(false)} className="mt-2 w-full py-2 text-sm text-slate-500 hover:text-brand-navy">Keep shopping</button>
          </div>
        )}
      </motion.aside>
    </motion.div>
    )}
    </AnimatePresence>
  );
}

/** Phones and tablets: the main links sit in a bar at the bottom of the screen, within thumb reach. */
const tabs = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/components", label: "Shop", icon: "grid" },
  { href: "/packs", label: "Packs", icon: "layers" },
  { href: "/pricing", label: "Pricing", icon: "tag" },
  { href: "/custom", label: "Custom", icon: "pencil" },
];
function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-2xl">
        {tabs.map((t) => {
          const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} aria-current={on ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-medium transition-colors ${on ? "text-ink" : "text-ink-faint hover:text-ink-soft"}`}>
                {on && <span className="absolute inset-x-1/4 top-0 h-[2px] rounded-full bg-tile-blue" />}
                <Icon name={t.icon} className="h-[22px] w-[22px]" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
