"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function Success() {
  const { clear, items } = useCart();
  useEffect(() => { if (items.length) clear(); }, [items.length, clear]);
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Payment received. Thank you</h1>
      <p className="mt-4 text-ink-soft">We&apos;re emailing you a download link for the managed solution and PDF user manual of each component. It usually arrives within a minute and works for 7 days.</p>
      <p className="mt-2 text-sm text-ink-soft">No email? Check your spam folder, or <Link href="/orders" className="text-tile-blue hover:underline">ask for a new link</Link>.</p>
      <Link href="/components" className="mt-8 inline-block rounded-lg bg-ink px-6 py-3.5 font-semibold text-white hover:bg-tile-blue">Browse more components</Link>
    </div>
  );
}
