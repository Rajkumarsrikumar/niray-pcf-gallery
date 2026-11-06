// Private Cloudflare R2 bucket for the paid files. Server only.
// R2 speaks the S3 API, so downloads are AWS Signature V4 presigned URLs that stop working after a few minutes.
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.
//
// Bucket layout (written by the PCF library build workflow):
//   components/<Component>/<version>/<Publisher>_<Component>_<version>_managed.zip
//   components/<Component>/<version>/<Publisher>_<Component>_<version>_unmanaged.zip   (kept private, never sold)
//   components/<Component>/<version>/<Publisher>_<Component>_<version>_User-Manual.pdf
import { createHash, createHmac } from "crypto";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const hmac = (key: string | Buffer, s: string) => createHmac("sha256", key).update(s).digest();
/** RFC 3986 encoding, as SigV4 requires. */
const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

export type Presign = {
  host: string;
  path: string; // already encoded, starts with /
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresIn: number;
  now?: Date;
  query?: Record<string, string>;
};

/** SigV4 query-string presigned GET URL (host is the only signed header). */
export function presignGet(p: Presign) {
  const amzDate = (p.now ?? new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${p.region}/s3/aws4_request`;
  const params: Record<string, string> = {
    ...p.query,
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${p.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(p.expiresIn),
    "X-Amz-SignedHeaders": "host",
  };
  const query = Object.keys(params).sort().map((k) => `${enc(k)}=${enc(params[k])}`).join("&");
  const canonical = ["GET", p.path, query, `host:${p.host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const key = hmac(hmac(hmac(hmac(`AWS4${p.secretAccessKey}`, date), p.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", key).update(toSign).digest("hex");
  return `https://${p.host}${p.path}?${query}&X-Amz-Signature=${signature}`;
}

export const r2Configured = () =>
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

/** Short-lived link to one private object. downloadName makes the browser save it under that file name. */
export function r2Url(key: string, expiresIn = 300, downloadName?: string) {
  if (!r2Configured()) throw new Error("R2 is not configured: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET");
  return presignGet({
    host: `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    path: `/${enc(process.env.R2_BUCKET!)}/${key.split("/").map(enc).join("/")}`,
    region: "auto",
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    expiresIn,
    query: downloadName ? { "response-content-disposition": `attachment; filename="${downloadName.replace(/"/g, "")}"` } : undefined,
  });
}

/** components/<Component>/<version>/<file>, with the version read from the file name (…_1_0_29_0_managed.zip -> 1.0.29.0). */
export function componentKey(component: string, file: string) {
  const v = file.match(/_(\d+)_(\d+)_(\d+)_(\d+)_/);
  return `components/${component}/${v ? v.slice(1).join(".") : "latest"}/${file}`;
}
