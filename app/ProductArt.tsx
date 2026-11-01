import Icon from "./Icon";
import { themeFor, type Component } from "@/lib/catalog";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

const pick = (c: Component) => {
  const t = `${c.name} ${c.category} ${c.tags.join(" ")}`.toLowerCase();
  if (/chart|kpi|dashboard|analytic|performance|score|trend/.test(t)) return "chart";
  if (/kanban|board|triage|queue|pipeline/.test(t)) return "board";
  if (/calendar|schedul|booking|slot|roster|timetable|gantt|timeline/.test(t)) return "calendar";
  if (/map|location|territory|route|floor/.test(t)) return "map";
  if (/form|wizard|intake|input|application|builder|editor/.test(t)) return "form";
  return ["table", "cards", "form", "chart"][hash(c.slug) % 4];
};

function Mock({ kind, accent, seed }: { kind: string; accent: string; seed: number }) {
  const r = (i: number, min: number, max: number) => min + ((seed >> i) % (max - min + 1));
  if (kind === "chart")
    return (
      <div className="flex h-full items-end gap-1.5 px-1 pb-1">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="flex-1 rounded-t" style={{ height: `${r(i, 25, 95)}%`, background: i % 3 === 2 ? accent : "rgba(255,255,255,.75)" }} />
        ))}
      </div>
    );
  if (kind === "board")
    return (
      <div className="grid h-full grid-cols-3 gap-1.5">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-1.5 rounded bg-white/15 p-1.5">
            {Array.from({ length: r(col + 2, 1, 3) }, (_, i) => (
              <div key={i} className="h-4 rounded bg-white/85" style={i === 0 && col === 1 ? { background: accent } : undefined} />
            ))}
          </div>
        ))}
      </div>
    );
  if (kind === "calendar")
    return (
      <div className="grid h-full grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => (
          <div key={i} className="rounded-sm" style={{ background: (i * 7 + seed) % 9 === 0 ? accent : (i * 3 + seed) % 5 === 0 ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.2)" }} />
        ))}
      </div>
    );
  if (kind === "map")
    return (
      <div className="relative h-full overflow-hidden rounded bg-white/15">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px)", backgroundSize: "16px 16px" }} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="absolute h-3 w-3 rounded-full ring-4 ring-white/30" style={{ left: `${r(i, 10, 85)}%`, top: `${r(i + 4, 10, 75)}%`, background: i === 0 ? accent : "#fff" }} />
        ))}
      </div>
    );
  if (kind === "form")
    return (
      <div className="flex h-full flex-col gap-1.5">
        <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= seed % 4 ? accent : "rgba(255,255,255,.3)" }} />)}</div>
        {[0, 1, 2].map((i) => (
          <div key={i}><div className="mb-0.5 h-1.5 w-1/3 rounded bg-white/50" /><div className="h-4 rounded bg-white/85" /></div>
        ))}
        <div className="ml-auto mt-auto h-4 w-1/3 rounded" style={{ background: accent }} />
      </div>
    );
  if (kind === "cards")
    return (
      <div className="grid h-full grid-cols-2 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-white/85 p-1.5"><div className="h-1.5 w-1/2 rounded" style={{ background: i === seed % 4 ? accent : "#cbd5e1" }} /><div className="mt-1.5 h-3 w-3/4 rounded bg-slate-300" /></div>
        ))}
      </div>
    );
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="h-3.5 rounded" style={{ background: accent }} />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-1">{[3, 2, 2, 1].map((w, j) => <div key={j} className="h-3 rounded bg-white/80" style={{ flex: w, opacity: j === 3 && i % 2 ? 0.45 : 1 }} />)}</div>
      ))}
    </div>
  );
}

export default function ProductArt({ c, size = "card" }: { c: Component; size?: "card" | "hero" }) {
  const t = themeFor(c.industry);
  const seed = hash(c.slug);
  return (
    <div className="relative overflow-hidden" style={{ background: t.color }}>
      <div className={size === "hero" ? "p-8 sm:p-12" : "p-5"}>
        <div className={`mx-auto rounded-lg border border-white/30 bg-white/10 ${size === "hero" ? "max-w-md" : ""}`}>
          <div className="flex items-center gap-1 border-b border-white/20 px-2 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" /><span className="h-1.5 w-1.5 rounded-full bg-white/60" /><span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            <span className="ml-2 truncate text-[9px] font-medium text-white/80">{c.name}</span>
          </div>
          <div className={`${size === "hero" ? "h-56" : "h-28"} p-2.5`}><Mock kind={pick(c)} accent={t.color === "#F4B400" ? "#102A43" : "#F4B400"} seed={seed} /></div>
        </div>
      </div>
      <span className="absolute bottom-2 left-2 rounded-full bg-black/20 p-1.5 text-white"><Icon name={t.icon} className="h-3.5 w-3.5" /></span>
    </div>
  );
}
