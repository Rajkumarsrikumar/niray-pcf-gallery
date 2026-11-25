import { NextResponse } from "next/server";
import { exists, getStats, isKind, visitorId } from "@/lib/server/engage";

export const dynamic = "force-dynamic";

// GET /api/engage?kind=component&slug=x -> thumbs up, downloads and published comments for one page.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const kind = u.searchParams.get("kind");
  const slug = u.searchParams.get("slug") ?? "";
  if (!isKind(kind) || !exists(kind, slug)) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  try {
    return NextResponse.json(await getStats(kind, slug, visitorId(req)), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("engage get", e);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
