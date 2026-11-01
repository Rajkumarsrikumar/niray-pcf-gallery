"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = { slug: string; name: string; kind: "component" | "pack" };
type Cart = { items: CartItem[]; open: boolean; add: (i: CartItem) => void; remove: (slug: string) => void; clear: () => void; setOpen: (o: boolean) => void; has: (slug: string) => boolean };

const Ctx = createContext<Cart | null>(null);
const KEY = "niray-pcf-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  const save = (next: CartItem[]) => { setItems(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} };
  const add = useCallback((i: CartItem) => { setItems((cur) => { const next = cur.some((c) => c.slug === i.slug) ? cur : [...cur, i]; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} return next; }); setOpen(true); }, []);
  const remove = (slug: string) => save(items.filter((i) => i.slug !== slug));
  const clear = () => save([]);
  const has = (slug: string) => items.some((i) => i.slug === slug);
  return <Ctx.Provider value={{ items, open, add, remove, clear, setOpen, has }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
