
"use client";

import { useState } from "react";
import styles from "./LacakPage.module.css";

type TrackingStep = {
  title: string;
  description: string;
  date: string;
  done: boolean;
};

type Order = {
  orderNumber: string;
  courier: string;
  estimate: string;
  status: string;
  steps: TrackingStep[];
};

// Data pesanan sementara
const orders: Order[] = [
  {
    orderNumber: "DGB001",
    courier: "J&T Express",
    estimate: "24 November 2026",
    status: "Dalam perjalanan",
    steps: [
      {
        title: "Pesanan dibuat",
        description: "Pesanan berhasil dibuat oleh pembeli.",
        date: "21 November 2026, 09:00",
        done: true,
      },
      {
        title: "Pesanan dikemas",
        description: "Penjual sedang menyiapkan paket.",
        date: "21 November 2026, 11:30",
        done: true,
      },
      {
        title: "Diserahkan ke kurir",
        description: "Paket sudah diterima oleh pihak kurir.",
        date: "21 November 2026, 14:00",
        done: true,
      },
      {
        title: "Dalam perjalanan",
        description: "Paket sedang dikirim menuju alamat tujuan.",
        date: "21 November 2026, 16:00",
        done: true,
      },
      {
        title: "Pesanan diterima",
        description: "Paket sudah sampai ke pembeli.",
        date: "Belum tersedia",
        done: false,
      },
    ],
  },
  {
    orderNumber: "DGB002",
    courier: "SiCepat",
    estimate: "25 November 2026",
    status: "Sedang dikemas",
    steps: [
      {
        title: "Pesanan dibuat",
        description: "Pesanan berhasil dibuat oleh pembeli.",
        date: "21 November 2026, 10:15",
        done: true,
      },
      {
        title: "Pesanan dikemas",
        description: "Penjual sedang menyiapkan paket.",
        date: "21 November 2026, 13:00",
        done: true,
      },
      {
        title: "Diserahkan ke kurir",
        description: "Paket akan diserahkan kepada kurir.",
        date: "Belum tersedia",
        done: false,
      },
      {
        title: "Dalam perjalanan",
        description: "Paket akan dikirim menuju alamat tujuan.",
        date: "Belum tersedia",
        done: false,
      },
      {
        title: "Pesanan diterima",
        description: "Paket sudah sampai ke pembeli.",
        date: "Belum tersedia",
        done: false,
      },
    ],
  },
];

export default function LacakPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = orders.find(
      (order) =>
        order.orderNumber.toLowerCase() ===
        orderNumber.trim().toLowerCase()
    );

    setFoundOrder(result || null);
    setSearched(true);
  };

  return (
    <main className={styles.page}>
      <header className={styles.navbar}>
        <a href="/" className={styles.logo}>
          Digeboy<span>E-Commerce.</span>
        </a>

        <nav>
          <a href="/">Search Produk</a>
          <a href="/lacak" className={styles.activeLink}>
            Lacak Pesanan
          </a>
          <a href="/#chat">Chat</a>
        </nav>
      </header>

      <section className={styles.header}>
        <p className={styles.subtitle}>
          DIGEBOY E-COMMERCE
        </p>

        <h1>Lacak Pesanan Kamu</h1>

        <p>
          Masukkan nomor pesanan untuk melihat posisi paket kamu.
        </p>
      </section>

      <section className={styles.container}>
        <form
          className={styles.searchForm}
          onSubmit={handleSearch}
        >
          <label htmlFor="orderNumber">
            Nomor Pesanan
          </label>

          <div className={styles.inputGroup}>
            <input
              id="orderNumber"
              type="text"
              placeholder="Contoh: DGB001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />

            <button type="submit">
              Lacak
            </button>
          </div>

          <small>
            Coba nomor pesanan DGB001 atau DGB002.
          </small>
        </form>

        {searched && !foundOrder && (
          <div className={styles.notFound}>
            <h3>Pesanan tidak ditemukan</h3>
            <p>
              Periksa kembali nomor pesanan yang kamu masukkan.
            </p>
          </div>
        )}

        {foundOrder && (
          <div className={styles.result}>
            <div className={styles.orderHeader}>
              <div>
                <span>Nomor Pesanan</span>
                <h2>{foundOrder.orderNumber}</h2>
              </div>

              <span className={styles.status}>
                {foundOrder.status}
              </span>
            </div>

            <div className={styles.infoGrid}>
              <div>
                <span>Kurir</span>
                <strong>{foundOrder.courier}</strong>
              </div>

              <div>
                <span>Estimasi Tiba</span>
                <strong>{foundOrder.estimate}</strong>
              </div>
            </div>

            <h3 className={styles.timelineTitle}>
              Riwayat Pengiriman
            </h3>

            <div className={styles.timeline}>
              {foundOrder.steps.map((step, index) => (
                <div
                  className={styles.timelineItem}
                  key={index}
                >
                  <div
                    className={
                      step.done
                        ? styles.doneDot
                        : styles.pendingDot
                    }
                  >
                    {step.done ? "✓" : ""}
                  </div>

                  <div className={styles.stepInfo}>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                    <small>{step.date}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        © 2026 Digeboy E-Commerce. All Rights Reserved.
      </footer>
    </main>
  );
}
