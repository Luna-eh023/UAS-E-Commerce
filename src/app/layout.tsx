import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import FlashSalePopup from "@/components/FlashSalePopup";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AuthNav from "@/components/AuthNav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "Digeboy",
  description: "E-commerce Digeboy",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-bs-theme",t)}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-bs-theme="light" suppressHydrationWarning>
      <AuthProvider>
        <body>
          <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: themeScript }}
          />
          <FlashSalePopup />

          <header className="bg-body border-bottom shadow-sm sticky-top">
            <div className="container d-flex align-items-center justify-content-between py-3">

              <Link
                href="/products"
                className="d-flex align-items-center gap-2 text-decoration-none"
              >
                <span className={`logo-mark ${poppins.className}`}>d</span>
                <span className={`logo-text ${poppins.className}`}>digeboy</span>
              </Link>

              <div className="d-flex align-items-center gap-3">
                <Link
                  href="/products"
                  className="text-decoration-none text-body d-none d-sm-inline"
                >
                  Produk
                </Link>
                <Link
                  href="/orders"
                  className="text-decoration-none text-muted d-none d-sm-inline"
                >
                  Pesanan Saya
                </Link>
                <AuthNav />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {children}
        </body>
      </AuthProvider>
    </html >
  );
}