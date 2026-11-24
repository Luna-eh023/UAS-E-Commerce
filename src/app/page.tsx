// src/app/page.tsx  (homepage at "/")
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "./components/geboy/geboy.css";
import AccountProvider, { useAccount } from "./components/geboy/AccountProvider";
import { fmtDate, watchVouchers, type Voucher } from "./lib/account";

function HomeContent() {
  const { account, error } = useAccount();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const ready = !!account;
  useEffect(() => {
    if (!ready) return;
    return watchVouchers(setVouchers);
  }, [ready]);

  return (
    <main className="gb-main">
      {error && <div className="gb-error">Gagal terhubung ke Firestore: {error}</div>}
      {!account && !error && <p className="gb-muted">Memuat...</p>}

      {account && (
        <>
          <h1 className="gb-home-hello">Halo, {account.name.split(" ")[0]}!</h1>
          <p className="gb-muted">Kelola akun, voucher, dan coin kamu di sini.</p>

          <div className="gb-home-grid">
            <Link href="/akun/profil" className="gb-home-card">
              <h2>Profil Akun</h2>
              {account.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={account.photoURL} alt="Foto profil" className="gb-avatar gb-home-avatar" />
              ) : (
                <div className="gb-avatar gb-home-avatar">{account.name.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <strong>{account.name}</strong>
                <div className="gb-muted">{account.email}</div>
              </div>
              <span className="gb-home-link">Lihat profil</span>
            </Link>

            <Link href="/akun/voucher" className="gb-home-card">
              <h2>Voucher</h2>
              <div className="gb-home-big">{vouchers.length}</div>
              <div className="gb-muted">voucher tersedia</div>
              <span className="gb-home-link">Lihat voucher</span>
            </Link>

            <Link href="/akun/bonus-coin" className="gb-home-card">
              <h2>Bonus Coin</h2>
              <div className="gb-home-big">{account.coins} Coin</div>
              <div className="gb-muted">Berakhir {fmtDate(account.coinExpiry, "-")}</div>
              <span className="gb-home-link">Dapatkan coin</span>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <AccountProvider>
      <div className="gb-shell">
        <HomeContent />
      </div>
    </AccountProvider>
  );
}
