// src/app/components/geboy/AccountTabs.tsx
// The tab row shared by every page under /akun.
// Teammates: when you build a page (e.g. Alamat), set ready:true and the right href.
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Profil", href: "/akun/profil", ready: true },
  { label: "Bank & Kartu", href: "#", ready: false },
  { label: "Alamat", href: "#", ready: false },
  { label: "Ubah Password", href: "#", ready: false },
  { label: "Pengaturan Notifikasi", href: "#", ready: false },
  { label: "Pengaturan Privasi", href: "#", ready: false },
  { label: "Voucher", href: "/akun/voucher", ready: true },
  { label: "Bonus Coin", href: "/akun/bonus-coin", ready: true },
];

export default function AccountTabs() {
  const pathname = usePathname();
  return (
    <div className="gb-tabs">
      {TABS.map((t) =>
        t.ready ? (
          <Link
            key={t.label}
            href={t.href}
            className={`gb-tab ${pathname.startsWith(t.href) ? "is-active" : ""}`}
          >
            {t.label}
          </Link>
        ) : (
          <span key={t.label} className="gb-tab is-disabled" title="Coming soon">
            {t.label}
          </span>
        )
      )}
    </div>
  );
}
