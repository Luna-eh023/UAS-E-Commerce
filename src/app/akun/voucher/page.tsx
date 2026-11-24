// src/app/akun/voucher/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "../../components/geboy/AccountProvider";
import {
  SHOP_URL,
  addVoucherByCode,
  deleteVoucher,
  fmtDate,
  shortRupiah,
  watchVouchers,
  type Voucher,
  type VoucherCategory,
} from "../../lib/account";

const FILTERS: ("Semua" | VoucherCategory)[] = ["Semua", "Geboy", "GeboyVIP", "Toko", "GeboyFood"];

const SIDE_COLOR: Record<VoucherCategory, string> = {
  Geboy: "#62c283",
  GeboyVIP: "#c9a227",
  Toko: "#e58fb0",
  GeboyFood: "#e8803a",
};

export default function VoucherPage() {
  const { account, error } = useAccount();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Semua");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // wait until the account exists (it is created on first load), then listen live
  const ready = !!account;
  useEffect(() => {
    if (!ready) return;
    return watchVouchers(setVouchers, setDbError);
  }, [ready]);

  async function onSave() {
    setMsg(null);
    try {
      await addVoucherByCode(code);
      setCode("");
      setMsg({ ok: true, text: "Voucher berhasil ditambahkan." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  const shown = vouchers.filter((v) => filter === "Semua" || v.category === filter);

  return (
    <>
      {(error || dbError) && <div className="gb-error">Gagal terhubung ke Firestore: {error || dbError}</div>}

      <div className="gb-card">
        <div className="gb-add-voucher">
          <strong>Tambah Voucher</strong>
          <input
            className="gb-input"
            placeholder="Masukkan kode voucher"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
          />
          <button className="gb-btn" onClick={onSave}>
            Simpan
          </button>
        </div>
        {msg && <p className={msg.ok ? "gb-ok" : "gb-error"}>{msg.text}</p>}
        <p className="gb-muted">Coba kode: FLOWER22, BAJU1, GEBOY10, GEBOYVIP, MAKAN15</p>
      </div>

      <div className="gb-filter" style={{ marginTop: 20 }}>
        {FILTERS.map((f) => (
          <button key={f} className={`gb-tab ${filter === f ? "is-active" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="gb-muted">Belum ada voucher di kategori ini.</p>
      ) : (
        <div className="gb-voucher-grid">
          {shown.map((v) => (
            <div key={v.id} className="gb-voucher">
              <div className="gb-voucher-side" style={{ background: SIDE_COLOR[v.category] }}>
                {v.category}
              </div>
              <div className="gb-voucher-body">
                <div className="gb-voucher-title">{v.title}</div>
                <div className="gb-muted">Min. Blj {shortRupiah(v.minSpend)}</div>
                <div className="gb-code">{v.code}</div>
                <div className="gb-muted">Hingga. {fmtDate(v.validUntil)}</div>
                <div className="gb-voucher-actions">
                  {/* goes to the shop page so the voucher can be used when buying */}
                  <Link href={SHOP_URL} className="gb-btn-outline">
                    Pakai Nanti
                  </Link>
                  <button className="gb-link-red" onClick={() => deleteVoucher(v.id)}>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
