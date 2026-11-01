"use client";
import Icon from "./Icon";
import { useCart, type CartItem } from "@/lib/cart";

export default function AddToCart({ item, variant = "solid", label }: { item: CartItem; variant?: "solid" | "icon" | "ghost"; label?: string }) {
  const { add, has } = useCart();
  const inCart = has(item.slug);
  if (variant === "icon")
    return (
      <button type="button" onClick={(e) => { e.preventDefault(); add(item); }} aria-label={inCart ? `${item.name} is in your basket` : `Add ${item.name} to basket`}
        className={`grid h-9 w-9 place-items-center rounded-full shadow-sm ring-1 ring-line transition-colors ${inCart ? "bg-tile-leaf text-white ring-tile-leaf" : "bg-white text-ink hover:bg-ink hover:text-white"}`}>
        <Icon name={inCart ? "check" : "cart"} className="h-4 w-4" />
      </button>
    );
  return (
    <button type="button" onClick={() => add(item)}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-semibold transition-colors ${variant === "solid" ? (inCart ? "bg-tile-leaf text-white" : "bg-ink text-white hover:bg-tile-blue") : "border border-ink/20 bg-white text-ink hover:border-ink"}`}>
      <Icon name={inCart ? "check" : "cart"} className="h-5 w-5" />
      {inCart ? "In your basket" : label ?? "Add to basket"}
    </button>
  );
}
