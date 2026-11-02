import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/api/", "/free/"] }], sitemap: "https://niraypcfgallery.com/sitemap.xml" };
}
