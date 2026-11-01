"use client";
import { motion } from "framer-motion";

/** Section that rises into place once, the first time it scrolls into view. */
export default function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }} className={className}>
      {children}
    </motion.section>
  );
}
