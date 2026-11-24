
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
  storeName: string;
  productName: string;
  category: string;
  image: string;
  quantity: number;
  price: number;
  courier: string;
  estimate: string;
  status: string;
  steps: TrackingStep[];
};

const orders: Order[] = [
  {
    orderNumber: "DGB001",
    storeName: "TechStore Official",
    productName: "Classic Sneakers",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    quantity: 1,
    price: 459000,
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
    storeName: "Fashion House",
    productName: "Minimalist Watch",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    quantity: 1,
    price: 329000,
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
  {
    orderNumber: "DGB003",
    storeName: "Bag Collection",
    productName: "Everyday Backpack",
    category: "Bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    quantity: 1,
    price: 275000,
    courier: "J&T Express",
    estimate: "27 November 2026",
    status: "Pesanan dibuat",
    steps: [
      {
        title: "Pesanan dibuat",
        description: "Pesanan berhasil dibuat dan menunggu proses penjual.",
        date: "22 November 2026, 10:00",
        done: true,
      },
      {
        title: "Pesanan dikemas",
        description: "Menunggu penjual menyiapkan paket.",
        date: "Belum tersedia",
        done: false,
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  const filters = [
    "Semua",
    "Pesanan dibuat",
    "Sedang dikemas",
    "Dalam perjalanan",
    "Pesanan selesai",
  ];

  const filteredOrders =
    selectedFilter === "Semua"
      ? orders
      : orders.filter((order) => order.status === selectedFilter);

  const formatPrice = (price: number) =>
    `Rp${price.toLocaleString("id-ID")}`;

  const toggleDetails = (orderNumber: string) => {
    setExpandedOrder((current) =>
      current === orderNumber ? null : orderNumber
    );
  };

  const getStatusClass = (status: string) => {
    if (status === "Dalam perjalanan") return styles.shipping;
    if (status === "Sedang dikemas") return styles.packing;
    if (status === "Pesanan selesai") return styles.completed;
    return styles.pending;
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
        <p className={styles.subtitle}>DIGEBOY E-COMMERCE</p>
        <h1>Pesanan Saya</h1>
        <p>Lihat dan pantau semua pesanan kamu di satu tempat.</p>
      </section>

      <section className={styles.container}>
        <div className={styles.orderSummary}>
          <div>
            <span>Total Pesanan</span>
            <h2>{orders.length}</h2>
          </div>

          <div>
            <span>Dalam Pengiriman</span>
            <h2>
              {orders.filter(
                (order) => order.status === "Dalam perjalanan"
              ).length}
            </h2>
          </div>

          <div>
            <span>Sedang Diproses</span>
            <h2>
              {orders.filter(
                (order) =>
                  order.status === "Sedang dikemas" ||
                  order.status === "Pesanan dibuat"
              ).length}
            </h2>
          </div>
        </div>

        <div className={styles.filterSection}>
          <h2>Daftar Pesanan</h2>

          <div className={styles.filters}>
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  selectedFilter === filter ? styles.activeFilter : ""
                }
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.orderList}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <article className={styles.orderCard} key={order.orderNumber}>
                <div className={styles.orderCardHeader}>
                  <div className={styles.storeInfo}>
                    <span className={styles.storeIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        width="19"
                        height="19"
                      >
                        <path d="M3 10h18l-1.5 11h-15L3 10Z" />
                        <path d="M3 10l2-7h14l2 7M9 21v-7h6v7M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                      </svg>
                    </span>

                    <div>
                      <h3>{order.storeName}</h3>
                      <span>{order.orderNumber}</span>
                    </div>
                  </div>

                  <span
                    className={`${styles.status} ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className={styles.productSection}>
                  <div className={styles.productImage}>
                    <img
                      src={order.image}
                      alt={order.productName}
                    />
                  </div>

                  <div className={styles.productDetails}>
                    <span className={styles.category}>
                      {order.category}
                    </span>

                    <h3>{order.productName}</h3>

                    <p>Variasi produk standar</p>

                    <span className={styles.quantity}>
                      x{order.quantity}
                    </span>
                  </div>

                  <div className={styles.productPrice}>
                    <span>Harga Produk</span>
                    <strong>{formatPrice(order.price)}</strong>
                  </div>
                </div>

                <div className={styles.deliveryInfo}>
                  <div>
                    <span>Kurir Pengiriman</span>
                    <strong>{order.courier}</strong>
                  </div>

                  <div>
                    <span>Estimasi Tiba</span>
                    <strong>{order.estimate}</strong>
                  </div>

                  <div className={styles.totalPrice}>
                    <span>Total Pembayaran</span>
                    <strong>{formatPrice(order.price * order.quantity)}</strong>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button
                    type="button"
                    className={styles.detailButton}
                    onClick={() => toggleDetails(order.orderNumber)}
                  >
                    {expandedOrder === order.orderNumber
                      ? "Tutup Detail"
                      : "Lihat Detail Pesanan"}
                    <span>
                      {expandedOrder === order.orderNumber ? "−" : "+"}
                    </span>
                  </button>
                </div>

                {expandedOrder === order.orderNumber && (
                  <div className={styles.trackingDetails}>
                    <h3>Riwayat Pengiriman</h3>

                    <div className={styles.timeline}>
                      {order.steps.map((step, index) => (
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
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>
              <h3>Tidak ada pesanan</h3>
              <p>Belum ada pesanan dengan status ini.</p>

              <button
                type="button"
                onClick={() => setSelectedFilter("Semua")}
              >
                Lihat Semua Pesanan
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        © 2026 Digeboy E-Commerce. All Rights Reserved.
      </footer>
    </main>
  );
}
