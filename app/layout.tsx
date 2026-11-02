import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import Motion from "./Motion";
import "./globals.css";
import Header from "./Header";
import Logo from "./Logo";
import { CartProvider } from "@/lib/cart";
import { CONTACT, allComponents } from "@/lib/catalog";
import { CORE_KEYWORDS } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://niraypcfgallery.com"),
  applicationName: "Niray PCF Gallery",
  openGraph: { siteName: "Niray PCF Gallery", type: "website", locale: "en_SG", images: [{ url: "/brand/logo.png", alt: "Niray PCF Gallery" }] },
  twitter: { card: "summary" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  title: { default: "Niray PCF Gallery | Power Apps PCF controls & code components", template: "%s" },
  keywords: [...CORE_KEYWORDS, "PCF gallery", "Niray PCF Gallery", "Niray IT Solutions"],
  description: `Shop ${allComponents.length} production-ready Power Apps Component Framework (PCF) controls and industry packs for Canvas apps, Model-driven apps and Power Pages, by Niray IT Solutions.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Motion><CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="mt-24 bg-ink text-slate-300">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Logo dark />
                <p className="mt-2 text-sm">Production-ready code components for Power Apps and Power Pages, built by Niray IT Solutions.</p>
              </div>
              <div>
                <p className="mb-3 font-semibold text-white">Shop</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/components" className="hover:text-white">All components</Link></li>
                  <li><Link href="/packs" className="hover:text-white">Industry packs</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-3 font-semibold text-white">Help</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/install" className="hover:text-white">How to install</Link></li>
                  <li><Link href="/custom" className="hover:text-white">Request custom development</Link></li>
                  <li><a href={`mailto:${CONTACT}`} className="hover:text-white">{CONTACT}</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-3 font-semibold text-white">Company</p>
                <p className="text-sm">Niray IT Solutions Pte. Ltd.<br />Singapore HQ · Branch in India</p>
                <a href="https://www.nirayitsolutions.com" className="mt-2 inline-block text-sm text-tile-sun hover:underline">nirayitsolutions.com</a>
              </div>
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Niray IT Solutions Pte. Ltd.</div>
          </footer>
        </CartProvider></Motion>
      </body>
    </html>
  );
}
