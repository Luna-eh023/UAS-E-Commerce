
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./FlashSaleBanner.module.css";

type Product = {
  id: number;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Earphone Bluetooth TWS",
    image: "/images/tws.jpg",
    originalPrice: 149000,
    salePrice: 89000,
  },
  {
    id: 2,
    name: "Mouse Wireless Slim",
    image: "/images/mousewireless.webp",
    originalPrice: 85000,
    salePrice: 49000,
  },
  {
    id: 3,
    name: "Power Bank 10000mAh",
    image: "/images/powerbank10000mah.webp",
    originalPrice: 189000,
    salePrice: 119000,
  },
];

const DURATION = 2 * 24 * 60 * 60 * 1000 +
  5 * 60 * 60 * 1000 +
  12 * 60 * 1000;

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FlashSaleBanner() {
  const [now, setNow] = useState(Date.now());
  const [target, setTarget] = useState(Date.now() + DURATION);
  const [reminder, setReminder] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const difference = Math.max(0, target - now);

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  function simulateUpcoming() {
    setTarget(Date.now() + DURATION);
    setNow(Date.now());
    setReminder(false);
  }

  function simulateLive() {
    setTarget(Date.now() + 3 * 60 * 60 * 1000 + 25 * 60 * 1000);
    setNow(Date.now());
    setReminder(false);
  }

  return (
    <section className={styles.banner}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>d</span>
          <span>DIGeboy</span>
        </div>

        <div className={styles.saleLabel}>
          FLASH SALE
        </div>

        <h2 className={styles.title}>
          BERSIAP UNTUK FLASH SALE!
        </h2>

        <p className={styles.subtitle}>
          Jangan sampai ketinggalan diskon spesial!
        </p>
      </div>

      {/* Countdown */}
      <div className={styles.countdownSection}>
        <p className={styles.countdownLabel}>
          FLASH SALE DIMULAI DALAM
        </p>

        <div className={styles.countdown}>
          <div className={styles.timeBox}>
            <strong>{days}</strong>
            <span>Hari</span>
          </div>

          <span className={styles.separator}>:</span>

          <div className={styles.timeBox}>
            <strong>{String(hours).padStart(2, "0")}</strong>
            <span>Jam</span>
          </div>

          <span className={styles.separator}>:</span>

          <div className={styles.timeBox}>
            <strong>{String(minutes).padStart(2, "0")}</strong>
            <span>Menit</span>
          </div>

          <span className={styles.separator}>:</span>

          <div className={styles.timeBox}>
            <strong>{String(seconds).padStart(2, "0")}</strong>
            <span>Detik</span>
          </div>
        </div>
      </div>

      {/* Produk */}
      <div className={styles.productSection}>
        <h3>Produk Pilihan Flash Sale</h3>

        <div className={styles.productGrid}>
          {PRODUCTS.map((product) => (
            <div
              className={styles.productCard}
              key={product.id}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 600px) 100px, 180px"
                  className={styles.productImage}
                />

                <span className={styles.discountBadge}>
                  SALE
                </span>
              </div>

              <div className={styles.productInfo}>
                <p className={styles.productName}>
                  {product.name}
                </p>

                <p className={styles.originalPrice}>
                  {formatRupiah(product.originalPrice)}
                </p>

                <p className={styles.salePrice}>
                  {formatRupiah(product.salePrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setReminder(!reminder)}
        >
          {reminder
            ? "✓ Pengingat Diaktifkan"
            : "🔔 Ingatkan Saya"}
        </button>
      </div>

      {/* Simulation */}
      <div className={styles.testing}>
        <button
          type="button"
          onClick={simulateUpcoming}
        >
          Simulasi Upcoming
        </button>

        <button
          type="button"
          onClick={simulateLive}
        >
          Simulasi Live
        </button>
      </div>
    </section>
  );
}
