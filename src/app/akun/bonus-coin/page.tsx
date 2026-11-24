// src/app/akun/bonus-coin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAccount } from "../../components/geboy/AccountProvider";
import {
  DAILY_COIN,
  claimDailyCoin,
  fmtDate,
  todayStr,
  watchCoinHistory,
  type CoinEntry,
} from "../../lib/account";

export default function BonusCoinPage() {
  const { account, error } = useAccount();
  const [tab, setTab] = useState<"get" | "history">("get");
  const [history, setHistory] = useState<CoinEntry[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const ready = !!account;
  useEffect(() => {
    if (!ready) return;
    return watchCoinHistory(setHistory, setDbError);
  }, [ready]);

  const claimedToday = account?.lastClaimDate === todayStr();

  async function onClaim() {
    setMsg(null);
    try {
      await claimDailyCoin();
      setMsg({ ok: true, text: `+${DAILY_COIN} coin berhasil diklaim!` });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  return (
    <>
      <h1 className="gb-title">Bonus Coin</h1>
      {(error || dbError) && <div className="gb-error">Gagal terhubung ke Firestore: {error || dbError}</div>}
      {!account && !error && <p className="gb-muted">Memuat...</p>}

      {account && (
        <>
          <div className="gb-coin-hero">
            <div className="gb-coin-big">
              <span className="gb-coin">G</span>
              <div>
                <div>Coin Geboy</div>
                <div className="gb-coin-amount">
                  {account.coins} <span style={{ fontSize: 18 }}>Coin</span>
                </div>
              </div>
            </div>
            <button className="gb-btn" onClick={onClaim} disabled={claimedToday}>
              {claimedToday ? "Sudah diklaim" : "Dapatkan Coin"}
            </button>
          </div>

          <div className="gb-coin-info">
            <div>
              Coin tersedia<strong>{account.coins} Coin</strong>
            </div>
            <div>
              Coin akan berakhir<strong>{fmtDate(account.coinExpiry, "-")}</strong>
            </div>
          </div>

          {msg && <p className={msg.ok ? "gb-ok" : "gb-error"}>{msg.text}</p>}

          <div className="gb-tabs">
            <button className={`gb-tab ${tab === "get" ? "is-active" : ""}`} onClick={() => setTab("get")}>
              Dapatkan
            </button>
            <button className={`gb-tab ${tab === "history" ? "is-active" : ""}`} onClick={() => setTab("history")}>
              Riwayat Coin
            </button>
          </div>

          <div className="gb-card">
            {tab === "get" ? (
              <div className="gb-row">
                <div>
                  <strong>Bonus Coin Harian</strong>
                  <div className="gb-muted">Klaim +{DAILY_COIN} coin setiap hari.</div>
                </div>
                <button className="gb-btn" onClick={onClaim} disabled={claimedToday}>
                  {claimedToday ? "Sudah diklaim" : "Klaim"}
                </button>
              </div>
            ) : history.length === 0 ? (
              <p className="gb-muted">Belum ada riwayat coin.</p>
            ) : (
              history.map((h) => (
                <div key={h.id} className="gb-row">
                  <div>
                    <strong>{h.note}</strong>
                    <div className="gb-muted">{new Date(h.createdAt).toLocaleDateString("id-ID")}</div>
                  </div>
                  <span className="gb-plus">+{h.amount}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}
