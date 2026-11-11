// Fetches a component's managed solution and PDF user manual from the private PCF library and zips them.
// When R2 is configured the files come from the private R2 bucket, otherwise from PCF_FILE_URL_TEMPLATE (WebDAV).
import delivery from "@/data/delivery.json";
import { componentKey, r2Configured, r2Url } from "./r2";
import { makeZip } from "./zip";

type Entry = { component: string; managed: string; manualPdf: string };
const files = delivery as Record<string, Entry>;

export const canDeliver = (slug: string) => slug in files;
export const deliveryEntry = (slug: string): Entry | undefined => files[slug];

/** Short-lived R2 link to a component's managed zip or PDF manual, saved under its real file name. */
export function downloadUrl(slug: string, file: "managed" | "manual") {
  const entry = files[slug];
  if (!entry) throw new Error(`No delivery files for ${slug}`);
  const name = file === "managed" ? entry.managed : entry.manualPdf;
  return r2Url(componentKey(entry.component, name), 300, name);
}

/**
 * PCF_FILE_URL_TEMPLATE is the URL of one library file, with placeholders {component}, {slug} and {file},
 * e.g. https://library.example.com/PCF-Library/Final%20PCF/{file}. PCF_FILES_USER / PCF_FILES_PASSWORD add
 * HTTP Basic auth (WebDAV).
 */
async function fetchFile(slug: string, entry: Entry, file: string) {
  if (r2Configured()) {
    const res = await fetch(r2Url(componentKey(entry.component, file)), { cache: "no-store" });
    if (!res.ok) throw new Error(`R2 file ${file} returned ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const template = process.env.PCF_FILE_URL_TEMPLATE;
  if (!template) throw new Error("PCF_FILE_URL_TEMPLATE is not set");
  const url = template
    .replaceAll("{component}", encodeURIComponent(entry.component))
    .replaceAll("{slug}", encodeURIComponent(slug))
    .replaceAll("{file}", encodeURIComponent(file));
  const user = process.env.PCF_FILES_USER;
  const headers: Record<string, string> = {};
  if (user) headers.Authorization = `Basic ${Buffer.from(`${user}:${process.env.PCF_FILES_PASSWORD ?? ""}`).toString("base64")}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Library file ${file} returned ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Zip with exactly two files: the managed solution and the PDF user manual. */
export async function buildDeliveryZip(slug: string) {
  const entry = files[slug];
  if (!entry) throw new Error(`No delivery files for ${slug}`);
  const [managed, manual] = await Promise.all([fetchFile(slug, entry, entry.managed), fetchFile(slug, entry, entry.manualPdf)]);
  return {
    filename: `Niray_${entry.component}.zip`,
    content: makeZip([
      { name: entry.managed, data: managed },
      { name: entry.manualPdf, data: manual },
    ]),
  };
}
