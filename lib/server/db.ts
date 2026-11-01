// Free-claim records in Upstash Redis (REST API). Server only: never import from a client component.
// Keys: claim:<email> -> JSON FreeClaim; token:<sha256> -> email (expires with the link).

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis REST URL or token is not set");
  return { url: url.replace(/\/$/, ""), token };
}

export type FreeClaim = {
  email: string; // normalised mailbox key, one record per mailbox
  send_to: string; // address as the visitor typed it
  slug: string;
  token_hash: string | null;
  requested_at: string;
  verified_at: string | null;
  delivered_at: string | null;
};

async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  const { url, token } = config();
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(`Redis ${command[0]} failed: ${res.status} ${data.error ?? ""}`);
  return data.result as T;
}

const claimKey = (email: string) => `claim:${email}`;
const tokenKey = (hash: string) => `token:${hash}`;

export async function getClaim(email: string) {
  const raw = await redis<string | null>("GET", claimKey(email));
  return raw ? (JSON.parse(raw) as FreeClaim) : null;
}

/** Create or replace a not-yet-delivered claim with a fresh verification token (the old link stops working). */
export async function upsertPendingClaim(email: string, sendTo: string, slug: string, tokenHash: string, expiresAt: Date) {
  const old = await getClaim(email);
  if (old?.delivered_at) return;
  if (old?.token_hash) await redis("DEL", tokenKey(old.token_hash));
  const claim: FreeClaim = { email, send_to: sendTo, slug, token_hash: tokenHash, requested_at: new Date().toISOString(), verified_at: null, delivered_at: null };
  await redis("SET", claimKey(email), JSON.stringify(claim));
  const ttl = Math.max(60, Math.round((expiresAt.getTime() - Date.now()) / 1000));
  await redis("SET", tokenKey(tokenHash), email, "EX", ttl);
}

/** Atomically consume a valid token (GETDEL): only one request can win, and only if nothing was delivered yet. */
export async function consumeToken(tokenHash: string) {
  const email = await redis<string | null>("GETDEL", tokenKey(tokenHash));
  if (!email) return null;
  const claim = await getClaim(email);
  if (!claim || claim.delivered_at || claim.token_hash !== tokenHash) return null;
  claim.verified_at = new Date().toISOString();
  await redis("SET", claimKey(email), JSON.stringify(claim));
  return claim;
}

/** Put the token back for an hour after a failed send so the same link can be tried again. */
export async function restoreToken(email: string, tokenHash: string) {
  await redis("SET", tokenKey(tokenHash), email, "EX", 3600);
}

export async function markDelivered(email: string) {
  const claim = await getClaim(email);
  if (!claim) return;
  claim.delivered_at = new Date().toISOString();
  claim.token_hash = null;
  await redis("SET", claimKey(email), JSON.stringify(claim));
}
