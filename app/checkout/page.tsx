"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CONTACT } from "@/lib/catalog";

export default function Checkout() {
  const { items, remove } = useCart();
  const body = encodeURIComponent(`Hello Niray team,\n\nI'd like a quote for:\n${items.map((i) => `- ${i.name} (${i.kind})`).join("\n")}\n\nCompany:\nNumber of environments:\n`);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Checkout</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-slate-600">Your basket is empty. <Link href="/components" className="text-brand-blue hover:underline">Start shopping</Link></p>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center justify-between gap-3 p-4">
                <div><p className="font-semibold text-brand-navy">{i.name}</p><p className="text-xs text-slate-500">{i.kind === "pack" ? "Industry pack" : "PCF component"}</p></div>
                <button onClick={() => remove(i.slug)} className="text-sm text-slate-400 hover:text-red-500">Remove</button>
              </li>
            ))}
          </ul>
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Online card payment opens soon. Send your basket and we'll reply with a quote and invoice.</p>
            <a href={`mailto:${CONTACT}?subject=${encodeURIComponent("PCF Gallery quote request")}&body=${body}`} className="mt-4 block rounded-xl bg-brand-navy py-3.5 text-center font-semibold text-white hover:bg-brand-blue">Request quote</a>
          </div>
        </div>
      )}
    </div>
  );
}
