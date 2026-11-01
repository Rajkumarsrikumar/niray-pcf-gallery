import { createHash, randomBytes } from "crypto";

/**
 * One free component per mailbox, so addresses are compared in a normal form:
 * lower case, "+tag" removed, and dots ignored for Gmail.
 */
export function normaliseEmail(raw: string) {
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  let [local, domain] = email.split("@");
  local = local.split("+")[0];
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  if (!local) return null;
  return { address: email, key: `${local}@${domain}` };
}

export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const siteUrl = () => (process.env.SITE_URL || "https://www.niraypcfgallery.com").replace(/\/$/, "");
