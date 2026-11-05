import { NextResponse } from "next/server";
import { canDeliver, downloadUrl } from "@/lib/server/files";
import { orderComponents, orderFromLink } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

// /api/orders/download?token=…&slug=…&file=managed|manual -> 5-minute private R2 link, only for components in the order.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const slug = q.get("slug") ?? "";
  const file = q.get("file") === "manual" ? "manual" : "managed";
  const found = await orderFromLink(q.get("token") ?? "").catch(() => null);
  if (!found) return new NextResponse("This download link has expired. Ask for a new one at /orders.", { status: 410 });
  if (!orderComponents(found.order).includes(slug) || !canDeliver(slug)) return new NextResponse("This file isn't part of your order or isn't ready yet.", { status: 404 });
  return NextResponse.redirect(downloadUrl(slug, file), { status: 302, headers: { "Cache-Control": "no-store" } });
}
