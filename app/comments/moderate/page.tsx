"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Result = { status: "approved" | "deleted" | "invalid" | "gone" | "error"; path?: string; title?: string };

const messages: Record<Result["status"], string> = {
  approved: "Approved. The comment is now on the page.",
  deleted: "Deleted. The comment won't appear on the site.",
  invalid: "This link isn't valid. Please use the buttons in the email again.",
  gone: "This comment was already handled, or it expired after 30 days without approval.",
  error: "Something went wrong on our side. Please try again shortly.",
};

function Moderate() {
  const q = useSearchParams();
  const id = q.get("id") ?? "";
  const token = q.get("token") ?? "";
  const action = q.get("action") === "delete" ? "delete" : "approve";
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async () => {
    setBusy(true);
    const res = await fetch("/api/engage/moderate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token, action }) }).catch(() => null);
    setResult(((await res?.json().catch(() => null)) as Result | null) ?? { status: "error" });
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{action === "delete" ? "Delete comment" : "Approve comment"}</h1>
      {result ? (
        <>
          <p className="mt-4 text-ink-soft" role="status">{messages[result.status]}</p>
          {result.path && <Link href={`${result.path}#comments`} className="mt-8 inline-block rounded-lg bg-ink px-6 py-3.5 font-semibold text-white hover:bg-tile-blue">Open {result.title}</Link>}
        </>
      ) : !id || !token ? (
        <p className="mt-4 text-ink-soft">{messages.invalid}</p>
      ) : (
        <>
          <p className="mt-4 text-ink-soft">{action === "delete" ? "Remove this comment from the site?" : "Show this comment on the page?"}</p>
          <button onClick={run} disabled={busy} className={`mt-8 w-full rounded-lg px-6 py-3.5 font-semibold text-white disabled:opacity-60 sm:w-auto ${action === "delete" ? "bg-red-700 hover:bg-red-800" : "bg-tile-leaf hover:bg-tile-blue"}`}>
            {busy ? "Working…" : action === "delete" ? "Yes, delete it" : "Yes, approve it"}
          </button>
        </>
      )}
    </div>
  );
}

export default function ModeratePage() {
  return <Suspense><Moderate /></Suspense>;
}
