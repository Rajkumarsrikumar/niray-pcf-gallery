// Free-claim records in Redis. Server only: never import from a client component.
// Keys: claim:<email> -> JSON FreeClaim; token:<sha256> -> email (expires with the link).
// Works with REDIS_URL (redis:// or rediss://, e.g. Redis Cloud from the Vercel marketplace) through a tiny
// built-in client, or with Upstash's REST API (KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_*).
import net from "net";
import tls from "tls";

export type FreeClaim = {
  email: string; // normalised mailbox key, one record per mailbox
  send_to: string; // address as the visitor typed it
  slug: string;
  token_hash: string | null;
  requested_at: string;
  verified_at: string | null;
  delivered_at: string | null;
};

type Reply = string | number | null | Reply[];

/** Encode one command in the Redis protocol (RESP). */
const encode = (args: (string | number)[]) =>
  `*${args.length}\r\n` + args.map((a) => { const s = String(a); return `$${Buffer.byteLength(s)}\r\n${s}\r\n`; }).join("");

/** Parse one RESP reply from buf at pos. Returns undefined when more data is needed. */
function parse(buf: Buffer, pos: number): { value: Reply | Error; end: number } | undefined {
  const lineEnd = buf.indexOf("\r\n", pos);
  if (lineEnd < 0) return;
  const type = String.fromCharCode(buf[pos]);
  const line = buf.toString("utf8", pos + 1, lineEnd);
  const next = lineEnd + 2;
  if (type === "+") return { value: line, end: next };
  if (type === "-") return { value: new Error(line), end: next };
  if (type === ":") return { value: Number(line), end: next };
  if (type === "$") {
    const len = Number(line);
    if (len < 0) return { value: null, end: next };
    if (buf.length < next + len + 2) return;
    return { value: buf.toString("utf8", next, next + len), end: next + len + 2 };
  }
  if (type === "*") {
    const n = Number(line);
    if (n < 0) return { value: null, end: next };
    const items: Reply[] = [];
    let at = next;
    for (let i = 0; i < n; i++) {
      const r = parse(buf, at);
      if (!r) return;
      if (r.value instanceof Error) return r;
      items.push(r.value);
      at = r.end;
    }
    return { value: items, end: at };
  }
  return { value: new Error(`Unexpected Redis reply type ${type}`), end: next };
}

/** Open a connection, authenticate, run one command, close. Fine for this low-traffic form. */
function viaSocket(redisUrl: string, command: (string | number)[]): Promise<Reply> {
  const u = new URL(redisUrl);
  const secure = u.protocol === "rediss:";
  const port = Number(u.port || 6379);
  const commands: (string | number)[][] = [];
  if (u.password) commands.push(["AUTH", decodeURIComponent(u.username || "default"), decodeURIComponent(u.password)]);
  const db = u.pathname.replace("/", "");
  if (db) commands.push(["SELECT", db]);
  commands.push(command);

  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect({ host: u.hostname, port, servername: u.hostname }) : net.connect({ host: u.hostname, port });
    let buf = Buffer.alloc(0);
    let done = 0;
    let pos = 0;
    const fail = (e: Error) => { socket.destroy(); reject(e); };
    socket.setTimeout(10_000, () => fail(new Error("Redis timed out")));
    socket.on("error", fail);
    socket.on(secure ? "secureConnect" : "connect", () => socket.write(commands.map(encode).join("")));
    socket.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      for (;;) {
        const r = parse(buf, pos);
        if (!r) return;
        pos = r.end;
        if (r.value instanceof Error) return fail(new Error(`Redis ${String(commands[done][0])} failed: ${r.value.message}`));
        if (++done === commands.length) { socket.end(); return resolve(r.value); }
      }
    });
  });
}

async function viaRest(url: string, token: string, command: (string | number)[]): Promise<Reply> {
  const res = await fetch(url.replace(/\/$/, ""), {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(`Redis ${command[0]} failed: ${res.status} ${data.error ?? ""}`);
  return data.result as Reply;
}

async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) return (await viaRest(restUrl, restToken, command)) as T;
  if (process.env.REDIS_URL) return (await viaSocket(process.env.REDIS_URL, command)) as T;
  throw new Error("No Redis configured: set REDIS_URL (or Upstash KV_REST_API_URL and KV_REST_API_TOKEN)");
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
