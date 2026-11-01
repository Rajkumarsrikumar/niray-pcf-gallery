"use client";
import { useState } from "react";
import Icon from "../../Icon";

export default function FreeDownload({ slug, name }: { slug: string; name: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please enter a valid email address.");
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/free/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, slug }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  if (state === "sent")
    return (
      <div className="mt-5 rounded-lg bg-tile-leaf/10 p-4 text-sm text-ink" role="status">
        <p className="flex items-center gap-2 font-semibold"><Icon name="check" className="h-4 w-4 text-tile-leaf" />Check your inbox</p>
        <p className="mt-1 text-ink-soft">We sent a confirmation link to <b className="break-all text-ink">{email.trim()}</b>. Open it to get {name} as a zip by email.</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="mt-5 border-t border-line pt-5">
      <p className="font-semibold text-ink">First component free</p>
      <p className="mt-1 text-sm text-ink-soft">New here? Get this component free: one per email address. We&apos;ll email you the managed solution and PDF user manual as a zip.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="free-email">Email address</label>
        <input id="free-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-ink/20 bg-white px-4 py-3 text-sm focus:border-tile-blue focus:outline-none focus:ring-4 focus:ring-tile-blue/10" />
        <button type="submit" disabled={state === "sending"} className="rounded-lg bg-tile-leaf px-5 py-3 font-semibold text-white hover:bg-tile-blue disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Get it free"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </form>
  );
}
