import { NextResponse } from "next/server";
import { getComponent, getPack, PRICE } from "@/lib/catalog";
import { siteUrl } from "@/lib/server/email";
import { saveCart, sellable } from "@/lib/server/orders";
import { r2Configured } from "@/lib/server/r2";
import { stripeConfigured, stripePost } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

// Opens a Stripe Checkout page for the basket. The basket is kept in Redis and the webhook turns it into an order.
export async function POST(req: Request) {
  if (!stripeConfigured() || !r2Configured()) return NextResponse.json({ error: "Card payment isn't open yet. Please request a quote." }, { status: 503 });
  let raw: unknown;
  try {
    raw = (await req.json()).items;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { items, rejected } = sellable(raw);
  if (rejected.length) return NextResponse.json({ error: "Some items in your basket aren't ready to buy yet. Please remove them and try again.", rejected }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });

  try {
    const cart = await saveCart(items);
    const session = await stripePost<{ url: string }>("checkout/sessions", {
      mode: "payment",
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/checkout`,
      client_reference_id: cart,
      metadata: { cart },
      line_items: items.map((i) => ({
        quantity: 1,
        price_data: {
          currency: "sgd",
          unit_amount: (i.kind === "pack" ? PRICE.pack : PRICE.component) * 100,
          product_data: { name: i.kind === "pack" ? `${getPack(i.slug)?.name} – industry pack` : `${getComponent(i.slug)?.name} – PCF component` },
        },
      })),
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout", e);
    return NextResponse.json({ error: "We couldn't open the payment page just now. Please try again shortly." }, { status: 502 });
  }
}
