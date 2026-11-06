// Paid orders in Redis. Server only.
// Keys:
//   cart:<id>            -> JSON OrderItem[] saved before Stripe Checkout opens (expires in 2 days)
//   order:<session id>   -> JSON Order (kept for good, so a buyer can always ask for a new link)
//   orders:<email>       -> set of session ids for that buyer
//   orderlink:<sha256>   -> session id; the emailed download link, valid for 7 days
import { allPacks, getComponent, getPack, isAvailable, packComponents } from "@/lib/catalog";
import { redis } from "./db";
import { hashToken, newToken } from "./email";
import { canDeliver } from "./files";

export type OrderItem = { slug: string; kind: "component" | "pack" };
export type Order = { id: string; email: string; items: OrderItem[]; amount: number; currency: string; paid_at: string; emailed_at?: string };

export const LINK_DAYS = 7;
const DAY = 24 * 60 * 60;

/** Keep only items that exist and can be sold: packs, and components whose files are ready. */
export function sellable(raw: unknown): { items: OrderItem[]; rejected: string[] } {
  const items: OrderItem[] = [];
  const rejected: string[] = [];
  for (const r of Array.isArray(raw) ? raw.slice(0, 100) : []) {
    const slug = String((r as OrderItem)?.slug ?? "");
    const kind = (r as OrderItem)?.kind === "pack" ? "pack" : "component";
    if (items.some((i) => i.slug === slug && i.kind === kind)) continue;
    if (kind === "pack" ? getPack(slug) : (() => { const c = getComponent(slug); return c && isAvailable(c) && canDeliver(slug); })()) items.push({ slug, kind });
    else rejected.push(slug);
  }
  return { items, rejected };
}

export async function saveCart(items: OrderItem[]) {
  const id = newToken().slice(0, 24);
  await redis("SET", `cart:${id}`, JSON.stringify(items), "EX", 2 * DAY);
  return id;
}

export async function getCart(id: string) {
  const raw = await redis<string | null>("GET", `cart:${id}`);
  return raw ? (JSON.parse(raw) as OrderItem[]) : null;
}

/** Store the order once per Stripe session. Returns false when it was already stored (webhook retry). */
export async function createOrder(order: Order) {
  const ok = await redis<string | null>("SET", `order:${order.id}`, JSON.stringify(order), "NX");
  if (ok !== "OK") return false;
  await redis("SADD", `orders:${order.email}`, order.id);
  return true;
}

export async function markEmailed(order: Order) {
  await redis("SET", `order:${order.id}`, JSON.stringify({ ...order, emailed_at: new Date().toISOString() }));
}

export async function getOrder(id: string) {
  const raw = await redis<string | null>("GET", `order:${id}`);
  return raw ? (JSON.parse(raw) as Order) : null;
}

export async function ordersFor(email: string) {
  const ids = (await redis<string[] | null>("SMEMBERS", `orders:${email}`)) ?? [];
  return (await Promise.all(ids.map(getOrder))).filter(Boolean) as Order[];
}

/** New download link for an order; older links keep working until they expire. */
export async function newOrderLink(orderId: string) {
  const token = newToken();
  await redis("SET", `orderlink:${hashToken(token)}`, orderId, "EX", LINK_DAYS * DAY);
  return token;
}

/** The order behind a link, with when the link expires. */
export async function orderFromLink(token: string) {
  if (!token) return null;
  const key = `orderlink:${hashToken(token)}`;
  const id = await redis<string | null>("GET", key);
  if (!id) return null;
  const order = await getOrder(id);
  if (!order) return null;
  const ttl = await redis<number>("TTL", key);
  return { order, expires_at: new Date(Date.now() + Math.max(0, ttl) * 1000).toISOString() };
}

/** Every component an order gives access to: components bought directly plus every component in a bought pack. */
export function orderComponents(order: Order) {
  const slugs = new Set<string>();
  for (const i of order.items) {
    if (i.kind === "component") slugs.add(i.slug);
    else { const p = allPacks.find((x) => x.slug === i.slug); if (p) packComponents(p).forEach((c) => slugs.add(c.slug)); }
  }
  return Array.from(slugs);
}

/** Rate limit for "email me a new link": one request a minute per address. */
export async function allowResend(email: string) {
  return (await redis<string | null>("SET", `orderresend:${email}`, "1", "EX", 60, "NX")) === "OK";
}
