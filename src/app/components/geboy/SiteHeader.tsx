// src/app/components/geboy/SiteHeader.tsx
// Copy of Charlie's header (logo + links) that works without his login/cart/wishlist providers.
"use client";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useAccount } from "./AccountProvider";
import "./SiteHeader.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "800"] });

export default function SiteHeader() {
  const { account } = useAccount();

  return (
    <header className="dgh-header">
      <div className="dgh-inner">
        <Link href="/" className="dgh-brand">
          <span className={`dgh-mark ${poppins.className}`}>d</span>
          <span className={`dgh-text ${poppins.className}`}>digeboy</span>
        </Link>

        <div className="dgh-right">
          <Link href="/products" className="dgh-link dgh-hide-sm">
            Produk
          </Link>
          <Link href="/orders" className="dgh-link dgh-muted dgh-hide-sm">
            Pesanan Saya
          </Link>
          <Link href="/wishlist" className="dgh-icon" aria-label="Wishlist" title="Wishlist">
            ♡
          </Link>
          <Link href="/cart" className="dgh-icon" aria-label="Keranjang" title="Keranjang">
            🛒
          </Link>

          {/* TODO (team member doing the login): replace this block with Charlie's <AuthNav /> */}
          {account && (
            <span className="dgh-user">
              <strong>{account.name}</strong>
            </span>
          )}
          <Link href="/akun/profil" className="dgh-btn">
            Akun Saya
          </Link>
        </div>
      </div>
    </header>
  );
}
