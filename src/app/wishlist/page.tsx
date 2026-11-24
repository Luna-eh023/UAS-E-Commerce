"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./wishlist.module.css";
import { useAuth } from "@/components/AuthProvider";
import { useWishlist } from "@/components/WishlistProvider";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { items, remove, moveToCart } = useWishlist();
  const [cat, setCat] = useState("Semua");
  const [toast, setToast] = useState("");

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const shown = cat === "Semua" ? items : items.filter((i) => i.category === cat);
  const total = shown.reduce((s, i) => s + i.price, 0);

  if (loading) return <main className={styles.page}><p className={styles.mute}>Memuat…</p></main>;

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <p>Masuk dulu untuk melihat wishlist kamu.</p>
          <Link className={styles.btn} href="/login">Masuk</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1>Wishlist</h1>
        <p className={styles.mute}>{shown.length} produk • Total: <strong>{rupiah(total)}</strong></p>
      </header>

      {items.length > 0 && (
        <div className={styles.chips} role="group" aria-label="Kategori">
          {categories.map((c) => (
            <button key={c} className={c === cat ? styles.chipOn : styles.chip} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className={styles.empty}>
          <p>Wishlist kamu masih kosong. Tekan ikon ♡ pada produk untuk menyimpannya.</p>
          <Link className={styles.btn} href="/products">Cari produk</Link>
        </div>
      )}

      <div className={styles.grid}>
        {shown.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.thumb}>
              <span aria-hidden>{p.emoji}</span>
              <button className={styles.x} aria-label={`Hapus ${p.name} dari wishlist`} onClick={() => remove(p.id)}>✕</button>
              <button
                className={styles.add}
                onClick={async () => { await moveToCart(p); setToast(`${p.name} dipindah ke keranjang`); setTimeout(() => setToast(""), 2500); }}
              >
                + Keranjang
              </button>
            </div>
            <h4>{p.name}</h4>
            <p className={styles.price}>
              <strong>{rupiah(p.price)}</strong>
              {p.originalPrice && <s>{rupiah(p.originalPrice)}</s>}
            </p>
            <p className={styles.mute}>★ {p.rating.toFixed(1)} • 📍 {p.location}</p>
          </article>
        ))}
      </div>

      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </main>
  );
}
