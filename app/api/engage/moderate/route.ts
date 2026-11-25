import { NextResponse } from "next/server";
import { moderate } from "@/lib/server/engage";

export const dynamic = "force-dynamic";

// POST, not GET, so mail scanners that open the email's links can't approve or delete on their own.
export async function POST(req: Request) {
  const { id, token, action } = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof id !== "string" || typeof token !== "string" || (action !== "approve" && action !== "delete"))
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  try {
    return NextResponse.json(await moderate(id, token, action));
  } catch (e) {
    console.error("engage moderate", e);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
