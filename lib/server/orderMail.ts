// Email with the order's download link. Server only.
import { getComponent, getPack } from "@/lib/catalog";
import { siteUrl } from "./email";
import { escapeHtml, sendMail } from "./mail";
import { LINK_DAYS, newOrderLink, type Order } from "./orders";

const itemName = (i: Order["items"][number]) => (i.kind === "pack" ? `${getPack(i.slug)?.name ?? i.slug} (industry pack)` : getComponent(i.slug)?.name ?? i.slug);

export async function sendOrderLink(order: Order, firstTime: boolean) {
  const token = await newOrderLink(order.id);
  const link = `${siteUrl()}/orders?token=${token}`;
  const names = order.items.map(itemName);
  const intro = firstTime ? "Thank you for your order. Your payment was received." : "Here is a new download link for your Niray PCF order.";
  await sendMail({
    to: order.email,
    subject: firstTime ? "Your Niray PCF download is ready" : "Your new Niray PCF download link",
    text: `Hello,\n\n${intro}\n\nYou bought:\n${names.map((n) => `- ${n}`).join("\n")}\n\nDownload the managed solution and the PDF user manual for each component here:\n${link}\n\nThe link works for ${LINK_DAYS} days. After that you can ask for a new one at ${siteUrl()}/orders using this email address.\n\nNiray IT Solutions`,
    html: `<p>Hello,</p><p>${intro}</p><p>You bought:</p><ul>${names.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul><p><a href="${link}" style="display:inline-block;background:#003B5C;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Download my components</a></p><p>Each component has its managed solution and PDF user manual. The link works for ${LINK_DAYS} days. After that you can ask for a new one at <a href="${siteUrl()}/orders">niraypcfgallery.com/orders</a> using this email address.</p><p>Niray IT Solutions</p>`,
  });
}
