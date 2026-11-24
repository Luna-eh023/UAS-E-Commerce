
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
      <body>
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
