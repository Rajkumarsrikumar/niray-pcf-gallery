"use client";
import { MotionConfig } from "framer-motion";

/** Framer Motion defaults for the whole site; honours the visitor's reduced-motion setting. */
export default function Motion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>{children}</MotionConfig>;
}
