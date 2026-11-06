"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { CONTACT, formatPrice, priceOf } from "@/lib/catalog";

export default function Checkout() {
  const { items, remove } = useCart();
  const cardPayments = process.env.NEXT_PUBLIC_CARD_PAYMENTS === "on";
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const pay = async () => {
    setPaying(true);
    setError("");
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((i) => ({ slug: i.slug, kind: i.kind })) }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok && data?.url) { window.location.href = data.url; return; }
    setError(data?.error || "We couldn't open the payment page. Please try again.");
    setPaying(false);
  };
  const total = items.reduce((s, i) => s + priceOf(i.kind), 0);
  const body = encodeURIComponent(`Hello Niray team,\n\nI'd like a quote for:\n${items.map((i) => `- ${i.name} (${i.kind}, ${formatPrice(priceOf(i.kind))})`).join("\n")}\n\nTotal: ${formatPrice(total)}\n\nCompany:\nNumber of environments:\n`);
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
                <div className="flex items-center gap-4"><span className="font-semibold text-brand-navy">{formatPrice(priceOf(i.kind))}</span><button onClick={() => remove(i.slug)} className="text-sm text-slate-400 hover:text-red-500">Remove</button></div>
              </li>
            ))}
          </ul>
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex justify-between text-lg font-bold text-brand-navy"><span>Total</span><span>{formatPrice(total)}</span></p>
            {cardPayments ? (
              <>
                <p className="mt-3 text-sm text-slate-500">Pay securely by card with Stripe. We email you a download link for the managed solution and PDF user manual right after payment.</p>
                <button onClick={pay} disabled={paying} className="mt-4 block w-full rounded-xl bg-brand-navy py-3.5 text-center font-semibold text-white hover:bg-brand-blue disabled:opacity-60">{paying ? "Opening payment…" : "Pay by card"}</button>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <a href={`mailto:${CONTACT}?subject=${encodeURIComponent("PCF Gallery quote request")}&body=${body}`} className="mt-3 block text-center text-sm text-brand-blue hover:underline">Need an invoice instead? Request a quote</a>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-slate-500">Online card payment opens soon. Send your basket and we'll reply with a quote and invoice.</p>
                <a href={`mailto:${CONTACT}?subject=${encodeURIComponent("PCF Gallery quote request")}&body=${body}`} className="mt-4 block rounded-xl bg-brand-navy py-3.5 text-center font-semibold text-white hover:bg-brand-blue">Request quote</a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
