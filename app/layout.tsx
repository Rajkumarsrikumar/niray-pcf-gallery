import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import Logo from "./Logo";
import { CartProvider } from "@/lib/cart";
import { CONTACT } from "@/lib/catalog";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], display: "swap", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Niray PCF Gallery | Power Apps code components",
  description: "Shop 178 production-ready Power Apps Component Framework (PCF) controls and industry packs for Canvas apps, Model-driven apps and Power Pages, by Niray IT Solutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} ${display.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="mt-20 bg-brand-navy text-slate-300">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Logo dark />
                <p className="mt-2 text-sm">Production-ready code components for Microsoft Power Platform, built by Niray IT Solutions.</p>
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
                <a href="https://www.nirayitsolutions.com" className="mt-2 inline-block text-sm text-brand-teal hover:underline">nirayitsolutions.com</a>
              </div>
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Niray IT Solutions Pte. Ltd. Microsoft, Power Apps and Power Pages are trademarks of Microsoft Corporation.</div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
