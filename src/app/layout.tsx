
import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Digeboy E-Commerce",
  description: "Belanja mudah bersama Digeboy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={plusJakartaSans.className}>
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <Link href="/" className="brand">
              <span className="brandMark">d</span>
              <span className="brandName">digeboy</span>
            </Link>

            <nav className="mainNav">
              <Link href="/search">Produk</Link>
              <Link href="/lacak-barang">Pesanan Saya</Link>
              <Link href="/chat">Chat</Link>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
