// Thumbs up, download counts and comments for component and pack pages, kept in the same Redis as free claims.
// Server only. Keys (t = "component" | "pack"):
//   likes:<t>:<slug>        set of hashed visitor ids (count = SCARD)
//   downloads:<t>:<slug>    integer, +1 per delivered zip
//   comments:<t>:<slug>     list of published comments (JSON), oldest first
//   pending:<id>            comment waiting for approval (JSON), expires after 30 days
//   published:<id>          "<t>|<slug>" for a published comment, so its Delete link can find it
//   commentrate:<visitor>   comments sent in the last hour by one visitor
import { createHash, randomBytes } from "crypto";
import { getComponent, getPack } from "@/lib/catalog";
import { redis } from "./db";
import { hashToken, siteUrl } from "./email";
import { escapeHtml, sendMail } from "./mail";

export type Kind = "component" | "pack";
export type PublicComment = { id: string; name: string; text: string; at: string };
type StoredComment = PublicComment & { kind: Kind; slug: string; token_hash: string };

/** true: a new comment waits until someone clicks Approve in the email. false: it shows at once, the email has Delete. */
export const COMMENTS_NEED_APPROVAL = true;
const PENDING_TTL = 30 * 24 * 3600;
const MAX_PER_HOUR = 5;
export const NAME_MAX = 60;
export const TEXT_MAX = 1000;

export const isKind = (k: unknown): k is Kind => k === "component" || k === "pack";
export const exists = (kind: Kind, slug: string) => (kind === "component" ? !!getComponent(slug) : !!getPack(slug));
export const titleOf = (kind: Kind, slug: string) => (kind === "component" ? getComponent(slug)?.name : getPack(slug)?.name) ?? slug;
const pagePath = (kind: Kind, slug: string) => `/${kind === "component" ? "components" : "packs"}/${slug}`;

/** A visitor is the hashed IP + browser, so the raw address is never stored. */
export function visitorId(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  return createHash("sha256").update(`niray-engage|${ip}|${ua}`).digest("hex").slice(0, 32);
}

const likesKey = (k: Kind, s: string) => `likes:${k}:${s}`;
const downloadsKey = (k: Kind, s: string) => `downloads:${k}:${s}`;
const commentsKey = (k: Kind, s: string) => `comments:${k}:${s}`;

async function downloadsFor(kind: Kind, slug: string) {
  if (kind === "component") return Number((await redis<string | null>("GET", downloadsKey(kind, slug))) ?? 0);
  // A pack counts its own downloads plus downloads of the components in it.
  const keys = [downloadsKey("pack", slug), ...(getPack(slug)?.components ?? []).map((c) => downloadsKey("component", c.slug))];
  const vals = await redis<(string | null)[]>("MGET", ...keys);
  return vals.reduce((n, v) => n + Number(v ?? 0), 0);
}

export async function getStats(kind: Kind, slug: string, visitor: string) {
  const [likes, liked, downloads, raw] = await Promise.all([
    redis<number>("SCARD", likesKey(kind, slug)),
    redis<number>("SISMEMBER", likesKey(kind, slug), visitor),
    downloadsFor(kind, slug),
    redis<string[]>("LRANGE", commentsKey(kind, slug), 0, -1),
  ]);
  const comments: PublicComment[] = raw.map((r) => { const c = JSON.parse(r) as StoredComment; return { id: c.id, name: c.name, text: c.text, at: c.at }; }).reverse();
  return { likes, liked: liked === 1, downloads, comments };
}

/** Toggle this visitor's thumbs up. */
export async function toggleLike(kind: Kind, slug: string, visitor: string) {
  const key = likesKey(kind, slug);
  const added = await redis<number>("SADD", key, visitor);
  if (!added) await redis("SREM", key, visitor);
  return { liked: added === 1, likes: await redis<number>("SCARD", key) };
}

export const countDownload = (kind: Kind, slug: string) => redis("INCR", downloadsKey(kind, slug));

/** Returns false when this visitor has sent too many comments in the last hour. */
export async function underRateLimit(visitor: string) {
  const key = `commentrate:${visitor}`;
  const n = await redis<number>("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 3600);
  return n <= MAX_PER_HOUR;
}

export async function addComment(kind: Kind, slug: string, name: string, text: string) {
  const id = randomBytes(9).toString("base64url");
  const token = randomBytes(24).toString("base64url");
  const c: StoredComment = { id, kind, slug, name, text, at: new Date().toISOString(), token_hash: hashToken(token) };
  if (COMMENTS_NEED_APPROVAL) await redis("SET", `pending:${id}`, JSON.stringify(c), "EX", PENDING_TTL);
  else await publish(c, JSON.stringify(c));
  try {
    await notifyOwner(c, token);
  } catch (e) {
    // Without the email nobody can approve it, so drop it and let the visitor try again.
    if (COMMENTS_NEED_APPROVAL) await redis("DEL", `pending:${id}`).catch(() => {});
    throw e;
  }
  return { published: !COMMENTS_NEED_APPROVAL };
}

async function notifyOwner(c: StoredComment, token: string) {
  const base = `${siteUrl()}/comments/moderate?id=${c.id}&token=${token}`;
  const page = `${siteUrl()}${pagePath(c.kind, c.slug)}`;
  const title = titleOf(c.kind, c.slug);
  const links = COMMENTS_NEED_APPROVAL
    ? [["Approve", `${base}&action=approve`], ["Delete", `${base}&action=delete`]]
    : [["Delete", `${base}&action=delete`]];
  await sendMail({
    to: process.env.COMMENTS_NOTIFY_TO || "info@nirayitsolutions.com",
    subject: `${COMMENTS_NEED_APPROVAL ? "Comment to approve" : "New comment"}: ${title}`,
    text: `${c.name} commented on ${title} (${page}):\n\n${c.text}\n\n${links.map(([l, u]) => `${l}: ${u}`).join("\n")}\n`,
    html: `<p><b>${escapeHtml(c.name)}</b> commented on <a href="${page}">${escapeHtml(title)}</a>:</p><blockquote style="border-left:3px solid #ccc;margin:0;padding-left:12px;white-space:pre-wrap">${escapeHtml(c.text)}</blockquote><p>${links.map(([l, u]) => `<a href="${u}" style="display:inline-block;margin-right:8px;padding:8px 16px;border-radius:6px;background:${l === "Approve" ? "#2E7D32" : "#B3261E"};color:#fff;text-decoration:none;font-weight:600">${l}</a>`).join("")}</p>${COMMENTS_NEED_APPROVAL ? "<p style=\"color:#666;font-size:13px\">Unapproved comments are dropped after 30 days.</p>" : ""}`,
  });
}

async function publish(c: StoredComment, raw: string) {
  await redis("RPUSH", commentsKey(c.kind, c.slug), raw);
  await redis("SET", `published:${c.id}`, `${c.kind}|${c.slug}`);
}

/** Approve or delete from the email link. Returns a short status for the moderation page. */
export async function moderate(id: string, token: string, action: "approve" | "delete") {
  const th = hashToken(token);
  const pendingRaw = await redis<string | null>("GET", `pending:${id}`);
  if (pendingRaw) {
    const c = JSON.parse(pendingRaw) as StoredComment;
    if (c.token_hash !== th) return { status: "invalid" as const };
    await redis("DEL", `pending:${id}`);
    if (action === "approve") await publish(c, pendingRaw);
    return { status: action === "approve" ? ("approved" as const) : ("deleted" as const), path: pagePath(c.kind, c.slug), title: titleOf(c.kind, c.slug) };
  }
  // Already published: published:<id> says which page list it is in.
  const where = await redis<string | null>("GET", `published:${id}`);
  if (!where) return { status: "gone" as const };
  const [kind, slug] = where.split("|") as [Kind, string];
  const list = await redis<string[]>("LRANGE", commentsKey(kind, slug), 0, -1);
  const raw = list.find((r) => (JSON.parse(r) as StoredComment).id === id);
  if (!raw) return { status: "gone" as const };
  if ((JSON.parse(raw) as StoredComment).token_hash !== th) return { status: "invalid" as const };
  if (action === "approve") return { status: "approved" as const, path: pagePath(kind, slug), title: titleOf(kind, slug) };
  await redis("LREM", commentsKey(kind, slug), 1, raw);
  await redis("DEL", `published:${id}`);
  return { status: "deleted" as const, path: pagePath(kind, slug), title: titleOf(kind, slug) };
}
