"use client";
import { useState } from "react";

export default function ResendForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/orders/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok) setState("done");
    else { setError(data?.error || "Something went wrong. Please try again."); setState("error"); }
  };
  if (state === "done") return <p className="mt-6 text-ink-soft">If {email} has bought from us, a new download link is on its way. Please check your inbox.</p>;
  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email you paid with" className="min-w-0 flex-1 rounded-lg border border-line px-4 py-3 text-ink" />
      <button disabled={state === "sending"} className="rounded-lg bg-ink px-6 py-3 font-semibold text-white hover:bg-tile-blue disabled:opacity-60">{state === "sending" ? "Sending…" : "Email me a new link"}</button>
      {state === "error" && <p className="text-sm text-red-600 sm:basis-full">{error}</p>}
    </form>
  );
}
