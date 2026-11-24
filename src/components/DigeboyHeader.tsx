import Link from "next/link";
import { Poppins } from "next/font/google";
import ThemeToggle from "./ThemeToggle";
import "./DigeboyHeader.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "800"],
});

// Header copied from Charlie's layout (logo, Produk, Pesanan Saya, theme toggle).
// Wishlist and login links are left out because those pages are not in this branch yet.
export default function DigeboyHeader() {
  return (
    <header className="dg-header">
      <div className="dg-header__row">
        <Link href="/" className="dg-brand">
          <span className={`dg-logo-mark ${poppins.className}`}>d</span>
          <span className={`dg-logo-text ${poppins.className}`}>digeboy</span>
        </Link>

        <div className="dg-header__right">
          <Link href="/products" className="dg-link">
            Produk
          </Link>
          <Link href="/orders" className="dg-link dg-link--muted">
            Pesanan Saya
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
