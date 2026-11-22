"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Mascot from "./Mascot";
import { formatRupiah } from "@/lib/orders";
import styles from "./FlashSalePopup.module.css";

type Mode = "upcoming" | "live";

const SESSION_KEY = "digeboy-flash-sale-seen";
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DURATIONS: Record<Mode, number> = {
  upcoming: 2 * DAY + 5 * HOUR + 12 * MINUTE,
  live: 3 * HOUR + 25 * MINUTE,
};

const PRODUCTS = [
  {
    name: "Earphone Bluetooth TWS",
    image: "/images/tws.jpg",
    price: 149000,
    salePrice: 89000,
  },
  {
    name: "Mouse Wireless Slim",
    image: "/images/mousewireless.webp",
    price: 85000,
    salePrice: 49000,
  },
  {
    name: "Power Bank 10000mAh",
    image: "/images/powerbank10000mah.webp",
    price: 189000,
    salePrice: 119000,
  },
];

function discountOf(price: number, salePrice: number): number {
  return Math.round((1 - salePrice / price) * 100);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

const MAX_DISCOUNT = Math.max(
  ...PRODUCTS.map((p) => discountOf(p.price, p.salePrice))
);

export default function FlashSalePopup() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("upcoming");
  const [target, setTarget] = useState(() => Date.now() + DURATIONS.upcoming);
  const [now, setNow] = useState(() => Date.now());
  const [reminder, setReminder] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    if (seen) return;

    const id = window.setTimeout(() => {
      const current = Date.now();
      setTarget(current + DURATIONS.upcoming);
      setNow(current);
      setOpen(true);
    }, 900);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), SECOND);
    return () => window.clearInterval(id);
  }, [open]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  };

  const switchMode = (next: Mode) => {
    const current = Date.now();
    setMode(next);
    setTarget(current + DURATIONS[next]);
    setNow(current);
  };

  const remaining = Math.max(0, target - now);
  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  const minutes = Math.floor((remaining % HOUR) / MINUTE);
  const seconds = Math.floor((remaining % MINUTE) / SECOND);
  const live = mode === "live";

  const boxes = live
    ? [
        { label: "Jam", value: hours + days * 24 },
        { label: "Menit", value: minutes },
        { label: "Detik", value: seconds },
      ]
    : [
        { label: "Hari", value: days },
        { label: "Jam", value: hours },
        { label: "Menit", value: minutes },
        { label: "Detik", value: seconds },
      ];

  return (
    <Modal show={open} onHide={close} centered contentClassName={styles.content}>
      <div className={styles.banner}>
        <button
          type="button"
          className={`btn-close btn-close-white ${styles.close}`}
          aria-label="Tutup"
          onClick={close}
        />
        <div className={styles.mascotWrap}>
          <Mascot />
        </div>
        <span
          className={`${styles.pill} ${live ? styles.pillLive : styles.pillSoon}`}
        >
          {live && <span className={styles.dot} />}
          {live ? "Sedang berlangsung" : "Segera dimulai"}
        </span>
        <h2 className={styles.title}>
          {live
            ? "Flash Sale lagi berlangsung!"
            : "Flash Sale dimulai sebentar lagi!"}
        </h2>
      </div>

      <div className="p-4">
        <p className="text-muted text-center mb-3">
          {live
            ? `Buruan, diskon hingga ${MAX_DISCOUNT}% akan segera berakhir dan stok terbatas.`
            : `Siapkan keranjangmu. Diskon hingga ${MAX_DISCOUNT}% untuk aksesoris gadget pilihan.`}
        </p>

        <div className="text-center small fw-semibold text-muted mb-2">
          {live ? "Berakhir dalam" : "Dimulai dalam"}
        </div>
        <div className={styles.countdown}>
          {boxes.map((b) => (
            <div key={b.label} className={styles.box}>
              <div
                key={b.label === "Detik" ? b.value : "static"}
                className={`${styles.num} ${b.label === "Detik" ? styles.tick : ""}`}
              >
                {pad(b.value)}
              </div>
              <div className={styles.unit}>{b.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.products}>
          {PRODUCTS.map((p, i) => (
            <div
              key={p.name}
              className={styles.card}
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className={styles.off}>
                -{discountOf(p.price, p.salePrice)}%
              </span>
              <div className={styles.imageWrap}>
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="160px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.info}>
                <div className={styles.pname}>{p.name}</div>
                <div className={styles.sale}>{formatRupiah(p.salePrice)}</div>
                <div className={styles.old}>{formatRupiah(p.price)}</div>
              </div>
            </div>
          ))}
        </div>

        {live ? (
          <Link
            href="/"
            className="btn btn-primary btn-lg w-100 fw-bold"
            onClick={close}
          >
            Belanja Sekarang
          </Link>
        ) : (
          <Button
            variant={reminder ? "outline-primary" : "primary"}
            size="lg"
            className="w-100 fw-bold"
            onClick={() => setReminder((prev) => !prev)}
          >
            {reminder ? "✓ Pengingat Aktif" : "Ingatkan Saya"}
          </Button>
        )}
        <button
          type="button"
          className="btn btn-link text-muted w-100 mt-1"
          onClick={close}
        >
          Nanti saja
        </button>

        <div className={styles.sim}>
          Simulasi:
          <button
            type="button"
            className={`${styles.simBtn} ${!live ? styles.simActive : ""}`}
            onClick={() => switchMode("upcoming")}
          >
            Akan dimulai
          </button>
          ·
          <button
            type="button"
            className={`${styles.simBtn} ${live ? styles.simActive : ""}`}
            onClick={() => switchMode("live")}
          >
            Sedang berlangsung
          </button>
        </div>
      </div>
    </Modal>
  );
}
