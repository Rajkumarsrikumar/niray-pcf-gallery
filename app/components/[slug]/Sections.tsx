"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type Section = { id: string; title: string; summary?: string; body: React.ReactNode };

/** Full-width expand/collapse panels for the product page. */
export default function Sections({ sections, initiallyOpen = [] }: { sections: Section[]; initiallyOpen?: string[] }) {
  const [open, setOpen] = useState<string[]>(initiallyOpen);
  const all = open.length === sections.length;
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={() => setOpen(all ? [] : sections.map((s) => s.id))} className="text-sm font-semibold text-tile-blue hover:underline">
          {all ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="divide-y divide-line border-y border-line bg-white sm:rounded-2xl sm:border">
        {sections.map((s) => {
          const isOpen = open.includes(s.id);
          return (
            <section key={s.id} id={s.id}>
              <h2>
                <button type="button" onClick={() => toggle(s.id)} aria-expanded={isOpen} aria-controls={`${s.id}-panel`}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-6">
                  <span className="flex-1">
                    <span className="block text-lg font-bold tracking-tight text-ink">{s.title}</span>
                    {s.summary && !isOpen && <span className="mt-0.5 block text-sm text-ink-faint">{s.summary}</span>}
                  </span>
                  <motion.span aria-hidden="true" animate={{ rotate: isOpen ? 45 : 0 }} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-lg ${isOpen ? "border-ink bg-ink text-white" : "border-line text-ink"}`}>+</motion.span>
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`${s.id}-panel`} key="p" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }} className="overflow-hidden">
                    <div className="px-4 pb-6 sm:px-6">{s.body}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}
