// src/components/geboy/GeboyHeader.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "./AccountProvider";
import { SHOP_URL } from "../../lib/account";

// Teammates: add a new page here and it shows up in the top bar.
const NAV = [
  { href: "/akun/profil", label: "Profil Akun" },
  { href: "/akun/voucher", label: "Voucher" },
  { href: "/akun/bonus-coin", label: "Bonus Coin" },
];

export default function GeboyHeader() {
  const pathname = usePathname();
  const { account } = useAccount();

  return (
    <header className="gb-header">
      <Link href={SHOP_URL} className="gb-logo" title="Back to shop">
        <span className="gb-logo-dot" />
        Geboy
      </Link>

      <nav className="gb-nav">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`gb-nav-link ${pathname.startsWith(n.href) ? "is-active" : ""}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="gb-header-right">
        <Link href="/akun/bonus-coin" className="gb-coin-pill">
          <span className="gb-coin">G</span>
          {account ? account.coins : "-"} Coin
        </Link>
        <Link href="/akun/profil" className="gb-user">
          @{account ? account.username : "..."}
        </Link>
      </div>
    </header>
  );
}
