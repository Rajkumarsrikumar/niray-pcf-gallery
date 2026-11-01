"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Icon from "../../Icon";

function Verify() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const confirm = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/free/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setMessage(`${data.name} is on its way to ${data.to}. The zip has the managed solution and the PDF user manual.`);
      setState("done");
    } catch (err) {
      setMessage((err as Error).message);
      setState("error");
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{state === "done" ? "Sent. Check your inbox" : "Get your free component"}</h1>
      {state === "done" ? (
        <>
          <p className="mt-4 flex items-start justify-center gap-2 text-ink-soft"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-tile-leaf" />{message}</p>
          <Link href="/components" className="mt-8 inline-block rounded-lg bg-ink px-6 py-3.5 font-semibold text-white hover:bg-tile-blue">Browse more components</Link>
        </>
      ) : !token ? (
        <p className="mt-4 text-ink-soft">This link is missing its code. Please open the link from your email again.</p>
      ) : (
        <>
          <p className="mt-4 text-ink-soft">Confirm your email and we&apos;ll send the managed solution and PDF user manual to you as a zip.</p>
          <button onClick={confirm} disabled={state === "sending"} className="mt-8 w-full rounded-lg bg-tile-leaf px-6 py-3.5 font-semibold text-white hover:bg-tile-blue disabled:opacity-60 sm:w-auto">
            {state === "sending" ? "Sending your download…" : "Confirm and email my download"}
          </button>
          {state === "error" && <p className="mt-4 text-sm text-red-600" role="alert">{message}</p>}
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><Verify /></Suspense>;
}
