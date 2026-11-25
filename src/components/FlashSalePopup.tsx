
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./FlashSalePopup.module.css";

type Mode = "upcoming" | "live";

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

const UPCOMING_DURATION =
  2 * 24 * 60 * 60 * 1000 +
  5 * 60 * 60 * 1000 +
  12 * 60 * 1000;

const LIVE_DURATION =
  3 * 60 * 60 * 1000 +
  25 * 60 * 1000;

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCountdown(target: number, now: number) {
  const difference = Math.max(0, target - now);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );
  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );
  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  return { days, hours, minutes, seconds };
}

export default function FlashSalePopup() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("upcoming");
  const [target, setTarget] = useState(0);
  const [now, setNow] = useState(0);
  const [reminder, setReminder] = useState(false);

  // Popup muncul otomatis saat halaman dibuka.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMode("upcoming");
      setTarget(Date.now() + UPCOMING_DURATION);
      setNow(Date.now());
      setOpen(true);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, []);

  // Countdown berjalan setiap detik.
  useEffect(() => {
    if (!open) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [open]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setTarget(
      Date.now() +
        (nextMode === "upcoming"
          ? UPCOMING_DURATION
          : LIVE_DURATION)
    );
    setNow(Date.now());
    setReminder(false);
  }

  function closePopup() {
    setOpen(false);
  }

  if (!open) return null;

  const countdown = getCountdown(target, now);

  return (
    <div className={styles.overlay}>
      <div
        className={styles.popup}
        role="dialog"
        aria-modal="true"
        aria-label="Flash Sale Digeboy"
      >
        {/* Tombol close */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={closePopup}
          aria-label="Tutup popup"
        >
          &times;
        </button>

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
            {mode === "upcoming"
              ? "BERSIAP UNTUK FLASH SALE!"
              : "FLASH SALE SEDANG BERLANGSUNG!"}
          </h2>

          <p className={styles.subtitle}>
            {mode === "upcoming"
              ? "Jangan sampai ketinggalan diskon spesial!"
              : "Buruan checkout sebelum harga kembali normal!"}
          </p>
        </div>

        {/* Countdown */}
        <div className={styles.countdownSection}>
          <p className={styles.countdownLabel}>
            {mode === "upcoming"
              ? "FLASH SALE DIMULAI DALAM"
              : "FLASH SALE BERAKHIR DALAM"}
          </p>

          <div className={styles.countdown}>
            {mode === "upcoming" && (
              <>
                <div className={styles.timeBox}>
                  <strong>{countdown.days}</strong>
                  <span>Hari</span>
                </div>
                <span className={styles.separator}>:</span>
              </>
            )}

            <div className={styles.timeBox}>
              <strong>
                {String(countdown.hours).padStart(2, "0")}
              </strong>
              <span>Jam</span>
            </div>

            <span className={styles.separator}>:</span>

            <div className={styles.timeBox}>
              <strong>
                {String(countdown.minutes).padStart(2, "0")}
              </strong>
              <span>Menit</span>
            </div>

            <span className={styles.separator}>:</span>

            <div className={styles.timeBox}>
              <strong>
                {String(countdown.seconds).padStart(2, "0")}
              </strong>
              <span>Detik</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className={styles.productSection}>
          <h3>
            {mode === "upcoming"
              ? "Produk Pilihan Flash Sale"
              : "Produk Flash Sale"}
          </h3>

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

        {/* Actions */}
        <div className={styles.actions}>
          {mode === "upcoming" ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setReminder(!reminder)}
            >
              {reminder
                ? "✓ Pengingat Diaktifkan"
                : "🔔 Ingatkan Saya"}
            </button>
          ) : (
            <Link
              href="/"
              className={styles.primaryButton}
              onClick={closePopup}
            >
              Belanja Sekarang
            </Link>
          )}

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={closePopup}
          >
            Nanti Saja
          </button>
        </div>

        {/* Testing controls */}
        <div className={styles.testing}>
          <button
            type="button"
            onClick={() => switchMode("upcoming")}
          >
            Simulasi Upcoming
          </button>

          <button
            type="button"
            onClick={() => switchMode("live")}
          >
            Simulasi Live
          </button>
        </div>
      </div>
    </div>
  );
}
