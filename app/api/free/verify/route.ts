import { NextResponse } from "next/server";
import { getComponent } from "@/lib/catalog";
import { consumeToken, markDelivered, restoreToken } from "@/lib/server/db";
import { hashToken } from "@/lib/server/email";
import { buildDeliveryZip } from "@/lib/server/files";
import { escapeHtml, sendMail } from "@/lib/server/mail";
import { countDownload } from "@/lib/server/engage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST, not GET, so mail scanners that open links can't trigger the delivery on their own.
export async function POST(req: Request) {
  let token = "";
  try {
    token = String((await req.json()).token ?? "");
  } catch {}
  if (!token) return NextResponse.json({ error: "This link is missing its code." }, { status: 400 });
  const tokenHash = hashToken(token);

  let claim;
  try {
    claim = await consumeToken(tokenHash);
  } catch (e) {
    console.error("free/verify consume", e);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again shortly." }, { status: 500 });
  }
  if (!claim) return NextResponse.json({ error: "This link has expired or was already used. You can ask again from the component page." }, { status: 410 });

  const component = getComponent(claim.slug);
  try {
    const zip = await buildDeliveryZip(claim.slug);
    const name = component?.name ?? claim.slug;
    await sendMail({
      to: claim.send_to,
      subject: `Your free Niray PCF component: ${name}`,
      text: `Hello,\n\nThanks for confirming your email. Your free component, ${name}, is attached as a zip with:\n- the managed solution, to import into your Power Platform environment\n- the PDF user manual\n\nInstall steps are in the manual. Need it customised or want more components? Reply to this email or visit https://www.niraypcfgallery.com.\n\nNiray IT Solutions`,
      html: `<p>Hello,</p><p>Thanks for confirming your email. Your free component, <b>${escapeHtml(name)}</b>, is attached as a zip with:</p><ul><li>the managed solution, to import into your Power Platform environment</li><li>the PDF user manual</li></ul><p>Install steps are in the manual. Need it customised or want more components? Reply to this email or visit <a href="https://www.niraypcfgallery.com">niraypcfgallery.com</a>.</p><p>Niray IT Solutions</p>`,
      attachments: [zip],
    });
    await markDelivered(claim.email);
    await countDownload("component", claim.slug).catch((err) => console.error("free/verify count", err));
    return NextResponse.json({ ok: true, name, to: claim.send_to });
  } catch (e) {
    console.error("free/verify deliver", e);
    await restoreToken(claim.email, tokenHash).catch((err) => console.error("free/verify restore", err));
    return NextResponse.json({ error: "We couldn't send your download just now. Please try this link again in a few minutes." }, { status: 502 });
  }
}
