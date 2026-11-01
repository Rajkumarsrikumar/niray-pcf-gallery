/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  output: "standalone",
  // Screenshots and brand images rarely change: let browsers reuse them for a day and refresh quietly after that.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/screens/:path*", headers: cache },
      { source: "/brand/:path*", headers: cache },
    ];
  },
};
