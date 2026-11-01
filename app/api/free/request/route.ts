import { NextResponse } from "next/server";
import { getComponent } from "@/lib/catalog";
import { getClaim, upsertPendingClaim } from "@/lib/server/db";
import { hashToken, newToken, normaliseEmail, siteUrl } from "@/lib/server/email";
import { canDeliver } from "@/lib/server/files";
import { escapeHtml, sendMail } from "@/lib/server/mail";

export const dynamic = "force-dynamic";

const RESEND_WAIT_MS = 60_000;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  let body: { email?: unknown; slug?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = normaliseEmail(String(body.email ?? ""));
  const slug = String(body.slug ?? "");
  const component = getComponent(slug);
  if (!email) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!component || !canDeliver(slug)) return NextResponse.json({ error: "This component isn't available as a free download." }, { status: 400 });

  try {
    const existing = await getClaim(email.key);
    if (existing?.delivered_at)
      return NextResponse.json({ error: "This email has already used its free component. Add components to your basket to buy more." }, { status: 409 });
    if (existing && Date.now() - new Date(existing.requested_at).getTime() < RESEND_WAIT_MS)
      return NextResponse.json({ error: "We just sent you an email. Please wait a minute before asking again." }, { status: 429 });

    const token = newToken();
    await upsertPendingClaim(email.key, email.address, slug, hashToken(token), new Date(Date.now() + TOKEN_TTL_MS));

    const link = `${siteUrl()}/free/verify?token=${token}`;
    const name = escapeHtml(component.name);
    await sendMail({
      to: email.address,
      subject: `Confirm your email to get ${component.name} free`,
      text: `Hello,\n\nConfirm your email to get your free Niray PCF component, ${component.name}:\n${link}\n\nWe'll then email you a zip with the managed solution and the PDF user manual. The link works for 24 hours. Each email address can get one component free.\n\nIf you didn't ask for this, you can ignore this email.\n\nNiray IT Solutions`,
      html: `<p>Hello,</p><p>Confirm your email to get your free Niray PCF component, <b>${name}</b>.</p><p><a href="${link}" style="display:inline-block;background:#003B5C;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Confirm and get my free component</a></p><p>We'll then email you a zip with the managed solution and the PDF user manual. The link works for 24 hours. Each email address can get one component free.</p><p style="color:#64748b;font-size:13px">If you didn't ask for this, you can ignore this email.</p><p>Niray IT Solutions</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("free/request", e);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again shortly." }, { status: 500 });
  }
}
