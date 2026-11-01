import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niray PCF Gallery | Power Apps code components",
  description: "Production-ready Power Apps Component Framework (PCF) controls for Canvas, Model-driven and Power Pages, by Niray IT Solutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand-navy">Niray <span className="text-brand-blue">PCF Gallery</span></Link>
            <nav className="flex gap-4 text-sm font-medium text-slate-600 sm:gap-6">
              <Link href="/#gallery" className="hover:text-brand-blue">Components</Link>
              <Link href="/packs" className="hover:text-brand-blue">Industry packs</Link>
              <Link href="/pricing" className="hover:text-brand-blue">Pricing</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Niray IT Solutions Pte. Ltd. ·{" "}
          <a href="https://www.nirayitsolutions.com" className="text-brand-blue hover:underline">nirayitsolutions.com</a> ·{" "}
          <a href="mailto:info@nirayitsolutions.com" className="text-brand-blue hover:underline">info@nirayitsolutions.com</a>
        </footer>
      </body>
    </html>
  );
}
