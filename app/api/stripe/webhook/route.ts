import { NextResponse } from "next/server";
import { normaliseEmail } from "@/lib/server/email";
import { sendOrderLink } from "@/lib/server/orderMail";
import { createOrder, getCart, getOrder, markEmailed } from "@/lib/server/orders";
import { verifyStripeSignature } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

type Session = {
  id: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  metadata?: { cart?: string };
  customer_details?: { email?: string };
};

// Stripe calls this after payment. Only a correctly signed, paid session creates an order and emails the link.
export async function POST(req: Request) {
  const body = await req.text();
  if (!verifyStripeSignature(body, req.headers.get("stripe-signature"))) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const event = JSON.parse(body) as { type: string; data: { object: Session } };
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return NextResponse.json({ received: true });

  const s = event.data.object;
  if (s.payment_status !== "paid") return NextResponse.json({ received: true });
  const email = normaliseEmail(s.customer_details?.email ?? "");
  const items = s.metadata?.cart ? await getCart(s.metadata.cart) : null;
  if (!email || !items) {
    console.error("stripe webhook: missing email or cart", s.id);
    return NextResponse.json({ error: "Missing email or cart" }, { status: 500 });
  }
  try {
    await createOrder({ id: s.id, email: email.address, items, amount: s.amount_total / 100, currency: s.currency, paid_at: new Date().toISOString() });
    // Stripe retries until we answer 2xx: a retry after a failed email sends it again, after a sent email it does nothing.
    const order = await getOrder(s.id);
    if (order && !order.emailed_at) {
      await sendOrderLink(order, true);
      await markEmailed(order);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("stripe webhook", e);
    return NextResponse.json({ error: "Delivery failed, Stripe will retry" }, { status: 500 });
  }
}
