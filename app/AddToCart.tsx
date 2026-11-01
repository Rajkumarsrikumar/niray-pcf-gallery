"use client";
import Icon from "./Icon";
import { useCart, type CartItem } from "@/lib/cart";

export default function AddToCart({ item, variant = "solid", label }: { item: CartItem; variant?: "solid" | "icon" | "ghost"; label?: string }) {
  const { add, has } = useCart();
  const inCart = has(item.slug);
  if (variant === "icon")
    return (
      <button type="button" onClick={(e) => { e.preventDefault(); add(item); }} aria-label={inCart ? `${item.name} is in your basket` : `Add ${item.name} to basket`}
        className={`grid h-9 w-9 place-items-center rounded-full shadow transition ${inCart ? "bg-brand-green text-white" : "bg-white text-brand-navy hover:bg-brand-navy hover:text-white"}`}>
        <Icon name={inCart ? "check" : "cart"} className="h-4 w-4" />
      </button>
    );
  return (
    <button type="button" onClick={() => add(item)}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold transition ${variant === "solid" ? (inCart ? "bg-brand-green text-white" : "bg-brand-navy text-white hover:bg-brand-blue") : "border border-slate-300 bg-white text-brand-navy hover:border-brand-blue"}`}>
      <Icon name={inCart ? "check" : "cart"} className="h-5 w-5" />
      {inCart ? "In your basket" : label ?? "Add to basket"}
    </button>
  );
}
