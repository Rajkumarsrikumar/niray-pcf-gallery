import { NextResponse } from "next/server";
import { NAME_MAX, TEXT_MAX, addComment, exists, isKind, underRateLimit, visitorId } from "@/lib/server/engage";

export const dynamic = "force-dynamic";

const clean = (s: unknown, max: number) => (typeof s === "string" ? s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { kind, slug } = body;
  if (!isKind(kind) || typeof slug !== "string" || !exists(kind, slug)) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  // Hidden field that people never see: bots that fill it in get a quiet "thanks" and nothing is saved.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true, published: false });
  const name = clean(body.name, NAME_MAX);
  const text = clean(body.text, TEXT_MAX);
  if (!name) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (text.length < 2) return NextResponse.json({ error: "Please write a comment." }, { status: 400 });
  try {
    if (!(await underRateLimit(visitorId(req)))) return NextResponse.json({ error: "You've sent a few comments already. Please try again in an hour." }, { status: 429 });
    return NextResponse.json({ ok: true, ...(await addComment(kind, slug, name, text)) });
  } catch (e) {
    console.error("engage comment", e);
    return NextResponse.json({ error: "We couldn't post your comment just now. Please try again shortly." }, { status: 503 });
  }
}
