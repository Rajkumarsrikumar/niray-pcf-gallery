import { NextResponse } from "next/server";
import { normaliseEmail } from "@/lib/server/email";
import { sendOrderLink } from "@/lib/server/orderMail";
import { allowResend, ordersFor } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

// Email a fresh 7-day link for every order bought with this address. Always answers the same way so it can't be used to look up buyers.
export async function POST(req: Request) {
  let raw = "";
  try {
    raw = String((await req.json()).email ?? "");
  } catch {}
  const email = normaliseEmail(raw);
  if (!email) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  try {
    if (await allowResend(email.address)) for (const order of await ordersFor(email.address)) await sendOrderLink(order, false);
  } catch (e) {
    console.error("orders/resend", e);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again shortly." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
