"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [menu, setMenu] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); router.push(`/components${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); setMenu(false); };
  return (
    <>
      <div className="bg-brand-navy px-4 py-2 text-center text-xs font-medium text-white">
        <span className="text-brand-teal">New:</span> 4 industry packs and 178 PCF components · Managed + unmanaged solutions and a user manual with every component
      </div>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
          <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}><Icon name={menu ? "x" : "menu"} className="h-6 w-6 text-brand-navy" /></button>
          <Link href="/" className="shrink-0" aria-label="Niray PCF Gallery home"><Logo /></Link>
          <form onSubmit={submit} className="relative hidden flex-1 md:block" role="search">
            <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 178 components: claims, bed board, timetable…" aria-label="Search components"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10" />
          </form>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
            {nav.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-brand-blue">{n.label}</Link>)}
          </nav>
          <button onClick={() => setOpen(true)} className="relative ml-auto rounded-full p-2 text-brand-navy hover:bg-slate-100 md:ml-0" aria-label={`Basket, ${items.length} items`}>
            <Icon name="cart" className="h-6 w-6" />
            {items.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-green px-1 text-[11px] font-bold text-white">{items.length}</span>}
          </button>
        </div>
        {menu && (
          <div className="border-t border-slate-100 px-4 pb-4 lg:hidden">
            <form onSubmit={submit} className="relative mt-3 md:hidden" role="search">
              <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components" aria-label="Search components" className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm" />
            </form>
            <nav className="mt-2 flex flex-col">
              {nav.map((n) => <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="border-b border-slate-100 py-3 font-medium text-brand-navy">{n.label}</Link>)}
            </nav>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}

function CartDrawer() {
  const { items, open, setOpen, remove } = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your basket">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
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
            <Link href="/checkout" onClick={() => setOpen(false)} className="block w-full rounded-xl bg-brand-navy py-3.5 text-center font-semibold text-white hover:bg-brand-blue">Continue to checkout</Link>
            <button onClick={() => setOpen(false)} className="mt-2 w-full py-2 text-sm text-slate-500 hover:text-brand-navy">Keep shopping</button>
          </div>
        )}
      </aside>
    </div>
  );
}
