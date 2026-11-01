import type { MetadataRoute } from "next";
import { allComponents, allPacks } from "@/lib/catalog";

const base = "https://niraypcfgallery.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/components", "/packs", "/pricing", "/install", "/custom"].map((p) => ({ url: `${base}${p}` }));
  return [
    ...pages,
    ...allPacks.map((p) => ({ url: `${base}/packs/${p.slug}` })),
    ...allComponents.map((c) => ({ url: `${base}/components/${c.slug}`, lastModified: c.dateBuilt ?? undefined })),
  ];
}
