import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";
import AuthNav from "@/components/AuthNav";
import FlashSalePopup from "@/components/FlashSalePopup";
import Providers from "@/components/Providers";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "Digeboy - E-Commerce",
  description: "E-Commerce Digeboy",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-bs-theme",t)}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-bs-theme="light" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />

        <Providers>
          <header className="bg-body border-bottom shadow-sm sticky-top">
            <div className="container d-flex align-items-center justify-content-between py-3">
              <div className="d-flex align-items-center gap-2">
                <span className={`logo-mark ${poppins.className}`}>
                  d
                </span>

                <span className={`logo-text ${poppins.className}`}>
                  digeboy
                </span>
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Link
                  href="/wishlist"
                  className="text-muted text-decoration-none"
                >
                  {"\u2661"} Wishlist
                </Link>

                <Link
                  href="/orders"
                  className="text-muted text-decoration-none d-none d-sm-inline"
                >
                  Pesanan Saya
                </Link>

                <AuthNav />

                <ThemeToggle />
              </div>
            </div>
          </header>

          {children}
        </Providers>

        <FlashSalePopup />
      </body>
    </html>
  );
}