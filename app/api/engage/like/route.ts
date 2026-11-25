import { NextResponse } from "next/server";
import { exists, isKind, toggleLike, visitorId } from "@/lib/server/engage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { kind, slug } = body as { kind?: unknown; slug?: unknown };
  if (!isKind(kind) || typeof slug !== "string" || !exists(kind, slug)) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  try {
    return NextResponse.json(await toggleLike(kind, slug, visitorId(req)));
  } catch (e) {
    console.error("engage like", e);
    return NextResponse.json({ error: "Couldn't save that just now. Please try again." }, { status: 503 });
  }
}
