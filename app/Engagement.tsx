"use client";
// Thumbs up, download count and comments for a component or pack page. The page itself stays static:
// the numbers load in the browser from /api/engage.
import { useEffect, useState, useSyncExternalStore } from "react";
import Icon from "./Icon";

type Kind = "component" | "pack";
type Comment = { id: string; name: string; text: string; at: string };
type Stats = { likes: number; liked: boolean; downloads: number; comments: Comment[] };

// One shared copy per page, so the bar and the comments section make a single request.
const stores = new Map<string, { data: Stats | null; failed: boolean; subs: Set<() => void>; started: boolean }>();
const storeFor = (key: string) => {
  let s = stores.get(key);
  if (!s) stores.set(key, (s = { data: null, failed: false, subs: new Set(), started: false }));
  return s;
};
const emit = (key: string) => storeFor(key).subs.forEach((f) => f());

function useStats(kind: Kind, slug: string) {
  const key = `${kind}:${slug}`;
  const s = storeFor(key);
  const snap = useSyncExternalStore(
    (cb) => { s.subs.add(cb); return () => s.subs.delete(cb); },
    () => s.data ?? (s.failed ? "failed" : null),
    () => null,
  );
  useEffect(() => {
    if (s.started) return;
    s.started = true;
    fetch(`/api/engage?kind=${kind}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Stats) => { s.data = d; emit(key); })
      .catch(() => { s.failed = true; emit(key); });
  }, [kind, slug, key, s]);
  const set = (fn: (d: Stats) => Stats) => { if (s.data) { s.data = fn(s.data); emit(key); } };
  return { data: snap === "failed" ? null : (snap as Stats | null), failed: snap === "failed", set };
}

const fmt = (n: number) => new Intl.NumberFormat("en-SG", { notation: n >= 10000 ? "compact" : "standard" }).format(n);
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;

/** Row of thumbs up, downloads and comment count. tone="light" for coloured hero backgrounds. */
export function EngageBar({ kind, slug, tone = "default" }: { kind: Kind; slug: string; tone?: "default" | "light" }) {
  const { data, failed, set } = useStats(kind, slug);
  const [busy, setBusy] = useState(false);
  if (failed) return null;
  const light = tone === "light";
  const chip = light ? "bg-white/15 text-current ring-1 ring-white/30" : "bg-white text-ink ring-1 ring-line";

  const like = async () => {
    if (!data || busy) return;
    setBusy(true);
    set((d) => ({ ...d, liked: !d.liked, likes: d.likes + (d.liked ? -1 : 1) }));
    try {
      const r = await fetch("/api/engage/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, slug }) });
      if (!r.ok) throw new Error();
      const res = (await r.json()) as { liked: boolean; likes: number };
      set((d) => ({ ...d, ...res }));
    } catch {
      set((d) => ({ ...d, liked: !d.liked, likes: d.likes + (d.liked ? -1 : 1) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${data ? "" : "opacity-60"}`} aria-busy={!data}>
      <button type="button" onClick={like} disabled={!data || busy} aria-pressed={data?.liked ?? false} aria-label={data?.liked ? "Remove your thumbs up" : "Give this a thumbs up"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors ${data?.liked ? (light ? "bg-white text-ink" : "bg-tile-blue text-white") : `${chip} hover:ring-current`}`}>
        <Icon name="thumb" className="h-4 w-4" />{data ? fmt(data.likes) : "–"}
      </button>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${chip}`}>
        <Icon name="download" className="h-4 w-4" />{data ? plural(data.downloads, "download", "downloads") : "– downloads"}
      </span>
      <a href="#comments" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${chip} hover:ring-current`}>
        <Icon name="chat" className="h-4 w-4" />{data ? plural(data.comments.length, "comment", "comments") : "– comments"}
      </a>
    </div>
  );
}

const when = (iso: string) => new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

/** Published comments plus the form to add one. New comments wait for approval before they show. */
export function Comments({ kind, slug, title }: { kind: Kind; slug: string; title: string }) {
  const { data, failed } = useStats(kind, slug);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please add your name.");
    if (text.trim().length < 2) return setError("Please write a comment.");
    setError("");
    setState("sending");
    try {
      const r = await fetch("/api/engage/comment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, slug, name, text, website }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong. Please try again.");
      setState("sent");
      setText("");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  const input = "w-full rounded-lg border border-ink/20 bg-white px-4 py-3 text-sm text-ink focus:border-tile-blue focus:outline-none focus:ring-4 focus:ring-tile-blue/10";
  return (
    <section id="comments" className="mt-16 scroll-mt-24">
      <h2 className="text-3xl font-extrabold tracking-tight text-ink">Comments{data ? <span className="ml-2 text-xl font-semibold text-ink-faint">{data.comments.length}</span> : null}</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {failed ? (
            <p className="text-ink-soft">Comments couldn&apos;t load just now.</p>
          ) : !data ? (
            <p className="text-ink-faint">Loading comments…</p>
          ) : data.comments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line p-6 text-ink-soft">No comments yet. Tell others what you think of {title}.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line bg-white sm:rounded-lg sm:border">
              {data.comments.map((c) => (
                <li key={c.id} className="p-4 sm:p-5">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm"><b className="text-ink">{c.name}</b><span className="text-ink-faint">{when(c.at)}</span></p>
                  <p className="mt-1.5 whitespace-pre-line break-words leading-relaxed text-ink-soft">{c.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form onSubmit={submit} noValidate className="h-fit rounded-lg border border-line bg-white p-5">
          <p className="font-semibold text-ink">Leave a comment</p>
          {state === "sent" ? (
            <div className="mt-3 rounded-lg bg-tile-leaf/10 p-4 text-sm" role="status">
              <p className="flex items-center gap-2 font-semibold text-ink"><Icon name="check" className="h-4 w-4 text-tile-leaf" />Thanks, {name.trim()}</p>
              <p className="mt-1 text-ink-soft">Your comment will appear here once it&apos;s been reviewed.</p>
              <button type="button" onClick={() => setState("idle")} className="mt-2 font-semibold text-tile-blue hover:underline">Write another</button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="sr-only" htmlFor="c-name">Your name</label>
              <input id="c-name" autoComplete="name" maxLength={60} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
              <label className="sr-only" htmlFor="c-text">Comment</label>
              <textarea id="c-text" rows={4} maxLength={1000} placeholder="What do you think?" value={text} onChange={(e) => setText(e.target.value)} className={`${input} resize-y`} />
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="c-website">Website</label>
                <input id="c-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ink-faint">Comments are reviewed before they appear.</p>
                <button type="submit" disabled={state === "sending"} className="shrink-0 rounded-lg bg-ink px-5 py-2.5 font-semibold text-white hover:bg-tile-blue disabled:opacity-60">{state === "sending" ? "Posting…" : "Post"}</button>
              </div>
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
