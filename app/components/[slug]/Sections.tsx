"use client";
import { useState } from "react";

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
      <div className="divide-y divide-line border-y border-line bg-white sm:rounded-lg sm:border">
        {sections.map((s) => {
          const isOpen = open.includes(s.id);
          return (
            <section key={s.id} id={s.id}>
              <h2>
                <button type="button" onClick={() => toggle(s.id)} aria-expanded={isOpen} aria-controls={`${s.id}-panel`}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-6">
                  <span className="flex-1">
                    <span className="block font-display text-lg font-bold text-ink">{s.title}</span>
                    {s.summary && !isOpen && <span className="mt-0.5 block text-sm text-ink-faint">{s.summary}</span>}
                  </span>
                  <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-lg text-ink transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
              </h2>
              <div id={`${s.id}-panel`} hidden={!isOpen} className="px-4 pb-6 sm:px-6">{s.body}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
