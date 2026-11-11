// Stripe Checkout through Stripe's REST API (no SDK). Server only.
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
import { createHmac, timingSafeEqual } from "crypto";

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

/** Flatten {a: {b: 1}, c: [{d: 2}]} into Stripe's form fields a[b]=1&c[0][d]=2. */
function form(obj: Record<string, unknown>, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null) continue;
    if (typeof v === "object") form(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function stripePost<T>(path: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Stripe ${path} failed: ${res.status} ${data?.error?.message ?? ""}`);
  return data as T;
}

/** Check the Stripe-Signature header (HMAC-SHA256 of "<t>.<body>", within 5 minutes). */
export function verifyStripeSignature(body: string, header: string | null, secret = process.env.STRIPE_WEBHOOK_SECRET ?? "", toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = header.split(",").map((p) => p.split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${body}`).digest("hex"));
  return sigs.some((s) => { const b = Buffer.from(s); return b.length === expected.length && timingSafeEqual(b, expected); });
}
