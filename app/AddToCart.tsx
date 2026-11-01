"use client";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import { useCart, type CartItem } from "@/lib/cart";

export default function AddToCart({ item, variant = "solid", label }: { item: CartItem; variant?: "solid" | "icon" | "ghost"; label?: string }) {
  const { add, has } = useCart();
  const inCart = has(item.slug);
  if (variant === "icon")
    return (
      <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={(e) => { e.preventDefault(); add(item); }} aria-label={inCart ? `${item.name} is in your basket` : `Add ${item.name} to basket`}
        className={`grid h-9 w-9 place-items-center rounded-full shadow-sm ring-1 ring-line transition-colors ${inCart ? "bg-tile-leaf text-white ring-tile-leaf" : "bg-white text-ink hover:bg-ink hover:text-white"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(inCart)} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><Icon name={inCart ? "check" : "cart"} className="h-4 w-4" /></motion.span>
        </AnimatePresence>
      </motion.button>
    );
  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => add(item)}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold transition-colors ${variant === "solid" ? (inCart ? "bg-tile-leaf text-white" : "bg-ink text-white hover:bg-tile-blue") : "border border-ink/20 bg-white text-ink hover:border-ink"}`}>
      <Icon name={inCart ? "check" : "cart"} className="h-5 w-5" />
      {inCart ? "In your basket" : label ?? "Add to basket"}
    </motion.button>
  );
}
