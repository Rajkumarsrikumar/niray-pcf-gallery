import { NextResponse } from "next/server";
import { redis } from "@/lib/server/db";
import { deliveryEntries, fetchFromLibrary, libraryConfigured } from "@/lib/server/files";
import { componentKey, r2Configured, r2Url } from "@/lib/server/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUDGET_MS = 45_000;

// One-time copy of the library files (managed zip, unmanaged zip, PDF manual) from the VPS into the private R2 bucket.
// Open /api/admin/r2-sync and reload until it says done. Safe to call any time: files already in R2 are skipped,
// only one run can go at a time, and the answer holds counts only, never file contents or links.
export async function GET() {
  if (!r2Configured() || !libraryConfigured()) return NextResponse.json({ error: "R2 or the VPS library isn't configured." }, { status: 503 });
  if ((await redis<string | null>("SET", "r2sync:lock", "1", "EX", 70, "NX")) !== "OK")
    return NextResponse.json({ error: "A copy is already running. Try again in a minute." }, { status: 429 });

  const started = Date.now();
  const result = { copied: 0, already_in_r2: 0, not_on_vps: [] as string[], failed: [] as string[], remaining: 0, done: false };
  const jobs = deliveryEntries().flatMap(([slug, e]) => [
    { slug, component: e.component, file: e.managed, required: true },
    { slug, component: e.component, file: e.managed.replace(/_managed\.zip$/, "_unmanaged.zip"), required: false },
    { slug, component: e.component, file: e.manualPdf, required: true },
  ]);

  try {
    for (let i = 0; i < jobs.length; i++) {
      if (Date.now() - started > BUDGET_MS) { result.remaining = jobs.length - i; break; }
      const j = jobs[i];
      const key = componentKey(j.component, j.file);
      try {
        if ((await fetch(r2Url(key, 60, undefined, "HEAD"), { method: "HEAD", cache: "no-store" })).ok) { result.already_in_r2++; continue; }
        const data = await fetchFromLibrary(j.slug, j.component, j.file);
        if (!data) { if (j.required) result.not_on_vps.push(j.file); continue; }
        const put = await fetch(r2Url(key, 300, undefined, "PUT"), { method: "PUT", body: new Uint8Array(data), cache: "no-store" });
        if (!put.ok) throw new Error(`R2 PUT ${put.status}`);
        result.copied++;
      } catch (e) {
        console.error("r2-sync", j.file, e);
        result.failed.push(j.file);
      }
    }
    result.done = result.remaining === 0;
    return NextResponse.json(result);
  } finally {
    await redis("DEL", "r2sync:lock").catch(() => {});
  }
}
