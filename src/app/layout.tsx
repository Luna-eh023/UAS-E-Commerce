import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "Digeboy - Status Pesanan",
  description: "Halaman status pesanan e-commerce Digeboy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <header className="bg-white border-bottom shadow-sm sticky-top">
          <div className="container d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <span className={`logo-mark ${poppins.className}`}>d</span>
              <span className={`logo-text ${poppins.className}`}>digeboy</span>
            </div>
            <span className="text-muted">Pesanan Saya</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
