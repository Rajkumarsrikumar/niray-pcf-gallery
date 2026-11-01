"use client";
import { useMemo, useState } from "react";
import ComponentCard from "./ComponentCard";
import type { Component } from "@/lib/catalog";

export default function Gallery({ items, industries }: { items: Component[]; industries: string[] }) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All");
  const [host, setHost] = useState("All");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(
      (c) =>
        (industry === "All" || c.industry === industry) &&
        (host === "All" || c.hosts.includes(host)) &&
        (!s || c.title.toLowerCase().includes(s) || c.summary.toLowerCase().includes(s) || c.tags.some((t) => t.includes(s))),
    );
  }, [items, q, industry, host]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components, e.g. bed board, claims, timetable" aria-label="Search components"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} aria-label="Industry" className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="All">All industries</option>
          {industries.map((i) => <option key={i}>{i}</option>)}
        </select>
        <select value={host} onChange={(e) => setHost(e.target.value)} aria-label="Host" className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="All">All hosts</option>
          {["Canvas", "Model-driven", "Power Pages"].map((h) => <option key={h}>{h}</option>)}
        </select>
      </div>
      <p className="mb-4 text-sm text-slate-500">{shown.length} of {items.length} components</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => <ComponentCard key={c.slug} c={c} />)}
      </div>
      {shown.length === 0 && <p className="py-12 text-center text-slate-500">No components match. Try a different search.</p>}
    </div>
  );
}
