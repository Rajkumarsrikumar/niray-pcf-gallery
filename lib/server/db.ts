// Tiny Supabase REST (PostgREST) client using the service-role key. Server only: never import from a client component.

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  return { url: url.replace(/\/$/, ""), key };
}

export type FreeClaim = {
  email: string; // normalised mailbox key, one row per mailbox
  send_to: string; // address as the visitor typed it
  slug: string;
  token_hash: string | null;
  token_expires_at: string | null;
  requested_at: string;
  verified_at: string | null;
  delivered_at: string | null;
};

async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const q = encodeURIComponent;

export async function getClaim(email: string) {
  const rows = await rest<FreeClaim[]>(`free_claims?email=eq.${q(email)}&select=*`);
  return rows[0] ?? null;
}

/** Create or replace a not-yet-delivered claim with a fresh verification token. */
export async function upsertPendingClaim(email: string, sendTo: string, slug: string, tokenHash: string, expiresAt: Date) {
  await rest(`free_claims?on_conflict=email`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify({ email, send_to: sendTo, slug, token_hash: tokenHash, token_expires_at: expiresAt.toISOString(), requested_at: new Date().toISOString(), verified_at: null }),
  });
}

/** Atomically consume a valid token: only one request can win, and only if nothing was delivered yet. */
export async function consumeToken(tokenHash: string) {
  const now = new Date().toISOString();
  const rows = await rest<FreeClaim[]>(
    `free_claims?token_hash=eq.${q(tokenHash)}&delivered_at=is.null&token_expires_at=gt.${q(now)}`,
    { method: "PATCH", prefer: "return=representation", body: JSON.stringify({ token_hash: null, verified_at: now }) },
  );
  return rows[0] ?? null;
}

/** Put the token back after a failed send so the same link can be tried again. */
export async function restoreToken(email: string, tokenHash: string) {
  await rest(`free_claims?email=eq.${q(email)}&delivered_at=is.null`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ token_hash: tokenHash }) });
}

export async function markDelivered(email: string) {
  await rest(`free_claims?email=eq.${q(email)}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ delivered_at: new Date().toISOString() }) });
}
