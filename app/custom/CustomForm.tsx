"use client";
import { useState } from "react";
import { CONTACT, allComponents } from "@/lib/catalog";

const field = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10";

export default function CustomForm() {
  const [f, setF] = useState({ name: "", email: "", company: "", type: "New component", base: "", hosts: [] as string[], budget: "", timeline: "", details: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const toggleHost = (h: string) => setF({ ...f, hosts: f.hosts.includes(h) ? f.hosts.filter((x) => x !== h) : [...f.hosts, h] });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || f.details.trim().length < 20) {
      setError("Please add your name, a valid email and at least a couple of sentences about what you need.");
      return;
    }
    setError("");
    const body = [
      `Name: ${f.name}`, `Email: ${f.email}`, `Company: ${f.company}`, `Request: ${f.type}`,
      f.base ? `Based on: ${f.base}` : "", `Hosts: ${f.hosts.join(", ") || "Not sure"}`, `Budget: ${f.budget || "-"}`, `Timeline: ${f.timeline || "-"}`, "", f.details,
    ].filter((x) => typeof x === "string" && x !== "").join("\n");
    window.location.href = `mailto:${CONTACT}?subject=${encodeURIComponent(`Custom PCF request: ${f.company || f.name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" noValidate>
      <h2 className="text-xl font-bold text-brand-navy">Request custom development</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Name *<input className={`${field} mt-1`} value={f.name} onChange={set("name")} autoComplete="name" /></label>
        <label className="text-sm font-medium text-slate-700">Work email *<input type="email" className={`${field} mt-1`} value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label className="text-sm font-medium text-slate-700">Company<input className={`${field} mt-1`} value={f.company} onChange={set("company")} autoComplete="organization" /></label>
        <label className="text-sm font-medium text-slate-700">What do you need?
          <select className={`${field} mt-1`} value={f.type} onChange={set("type")}>
            <option>New component</option><option>Customise a gallery component</option><option>Industry pack for my sector</option><option>Not sure yet</option>
          </select>
        </label>
      </div>
      {f.type === "Customise a gallery component" && (
        <label className="block text-sm font-medium text-slate-700">Which component?
          <select className={`${field} mt-1`} value={f.base} onChange={set("base")}>
            <option value="">Choose…</option>{allComponents.map((c) => <option key={c.slug}>{c.name}</option>)}
          </select>
        </label>
      )}
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Where will it run?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Canvas apps", "Model-driven apps", "Power Pages"].map((h) => (
            <button type="button" key={h} onClick={() => toggleHost(h)} aria-pressed={f.hosts.includes(h)}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${f.hosts.includes(h) ? "border-brand-blue bg-brand-blue text-white" : "border-slate-300 text-slate-600"}`}>{h}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Budget
          <select className={`${field} mt-1`} value={f.budget} onChange={set("budget")}><option value="">Prefer not to say</option><option>Under S$2,000</option><option>S$2,000 – 5,000</option><option>S$5,000 – 15,000</option><option>Over S$15,000</option></select>
        </label>
        <label className="text-sm font-medium text-slate-700">Timeline
          <select className={`${field} mt-1`} value={f.timeline} onChange={set("timeline")}><option value="">Flexible</option><option>Within 2 weeks</option><option>Within a month</option><option>1–3 months</option></select>
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">Describe the component *
        <textarea rows={5} className={`${field} mt-1`} value={f.details} onChange={set("details")} placeholder="What should users see and do? What data does it use? Any screens or examples you like?" />
      </label>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <button className="w-full rounded-xl bg-brand-navy py-3.5 font-semibold text-white hover:bg-brand-blue">Send request</button>
      <p className="text-center text-xs text-slate-500">Opens your email app addressed to {CONTACT}.</p>
    </form>
  );
}
