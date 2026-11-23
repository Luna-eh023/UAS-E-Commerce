"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./products.module.css";
import { CATEGORIES, LOCATIONS, Product, getProducts, seedProducts } from "@/lib/products";

type Sort = "relevan" | "termurah" | "termahal" | "rating";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [locs, setLocs] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("relevan");
  const [filterOpen, setFilterOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await getProducts());
    } catch (e) {
      setError("Gagal memuat produk. Periksa konfigurasi Firebase dan aturan Firestore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const reset = () => {
    setSearch(""); setCats([]); setLocs([]);
    setMinPrice(""); setMaxPrice(""); setMinRating(0); setSort("relevan");
  };

  const result = useMemo(() => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const list = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (cats.length === 0 || cats.includes(p.category)) &&
      (locs.length === 0 || locs.includes(p.location)) &&
      p.price >= min && p.price <= max && p.rating >= minRating
    );
    if (sort === "termurah") list.sort((a, b) => a.price - b.price);
    if (sort === "termahal") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "relevan") list.sort((a, b) => b.sold - a.sold);
    return list;
  }, [products, search, cats, locs, minPrice, maxPrice, minRating, sort]);

  const activeCount = cats.length + locs.length + (minPrice || maxPrice ? 1 : 0) + (minRating ? 1 : 0);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Digeboy</h1>
        <input
          className={styles.search}
          placeholder="Cari produk di Digeboy"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari produk"
        />
      </header>

      <div className={styles.chips} role="group" aria-label="Kategori">
        <button className={cats.length === 0 ? styles.chipOn : styles.chip} onClick={() => setCats([])}>Semua</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={cats.includes(c) ? styles.chipOn : styles.chip} onClick={() => toggle(cats, setCats, c)}>
            {c}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sideHead}>
            <h2>Filter</h2>
            <button className={styles.link} onClick={reset}>Reset</button>
          </div>

          <section>
            <h3>Harga</h3>
            <div className={styles.priceRow}>
              <input type="number" min={0} placeholder="Harga minimum" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <input type="number" min={0} placeholder="Harga maksimum" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </section>

          <section>
            <h3>Rating</h3>
            {[4.5, 4, 3].map((r) => (
              <label key={r} className={styles.check}>
                <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} />
                ★ {r} ke atas
              </label>
            ))}
            <label className={styles.check}>
              <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} />
              Semua rating
            </label>
          </section>

          <section>
            <h3>Lokasi</h3>
            {LOCATIONS.map((l) => (
              <label key={l} className={styles.check}>
                <input type="checkbox" checked={locs.includes(l)} onChange={() => toggle(locs, setLocs, l)} />
                {l}
              </label>
            ))}
          </section>

          <button className={styles.apply} onClick={() => setFilterOpen(false)}>
            Tampilkan {result.length} produk
          </button>
        </aside>

        <section className={styles.content}>
          <div className={styles.toolbar}>
            <button className={styles.filterBtn} onClick={() => setFilterOpen(true)}>
              Filter{activeCount ? ` (${activeCount})` : ""}
            </button>
            <p className={styles.count}>{loading ? "Memuat…" : `${result.length} produk`}</p>
            <label className={styles.sort}>
              Urutkan
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="relevan">Terlaris</option>
                <option value="termurah">Harga termurah</option>
                <option value="termahal">Harga termahal</option>
                <option value="rating">Rating tertinggi</option>
              </select>
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className={styles.empty}>
              <p>Belum ada produk di database.</p>
              <button className={styles.apply} onClick={async () => { await seedProducts(); load(); }}>
                Isi data contoh
              </button>
            </div>
          )}

          {!loading && products.length > 0 && result.length === 0 && (
            <div className={styles.empty}>
              <p>Tidak ada produk yang cocok. Coba ubah atau hapus filter.</p>
              <button className={styles.link} onClick={reset}>Reset filter</button>
            </div>
          )}

          <div className={styles.grid}>
            {result.map((p) => (
              <article key={p.id} className={styles.card}>
                <div className={styles.thumb} aria-hidden>{p.emoji}</div>
                <div className={styles.info}>
                  <h4>{p.name}</h4>
                  {p.originalPrice && <s className={styles.old}>{rupiah(p.originalPrice)}</s>}
                  <strong>{rupiah(p.price)}</strong>
                  <span className={styles.meta}>📍 {p.location}</span>
                  <span className={styles.meta}>★ {p.rating.toFixed(1)} | {p.sold.toLocaleString("id-ID")} terjual</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {filterOpen && <div className={styles.backdrop} onClick={() => setFilterOpen(false)} />}
    </main>
  );
}
