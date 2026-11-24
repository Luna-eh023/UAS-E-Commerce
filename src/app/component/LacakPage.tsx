
"use client";

import { useEffect, useState } from "react";
import styles from "./LacakPage.module.css";
import { getVisitorId } from "../../lib/chatService";
import {
  ORDER_RETENTION_DAYS,
  seedDemoOrdersOnce,
  subscribeToUserOrders,
  type TrackedOrder,
} from "../../lib/orderService";

export default function LacakPage() {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  // Pesanan dibaca realtime dari Firestore (hanya milik pengunjung ini)
  useEffect(() => {
    const visitorId = getVisitorId();

    // Simpan pesanan contoh ke Firestore sekali saja (jika belum pernah)
    seedDemoOrdersOnce(visitorId).catch(() => {
      setErrorMessage(
        "Gagal menyimpan pesanan ke database. Periksa Firestore Rules."
      );
    });

    const unsubscribe = subscribeToUserOrders(
      visitorId,
      (data) => {
        setOrders(data);
        setLoading(false);
        setErrorMessage("");
      },
      () => {
        setLoading(false);
        setErrorMessage(
          "Gagal terhubung ke database pesanan. Periksa koneksi internet dan Firestore Rules."
        );
      }
    );

    return () => unsubscribe();
  }, []);

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

  const toggleDetails = (orderId: string) => {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId
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
      <section className={styles.header}>
        <p className={styles.subtitle}>DIGEBOY E-COMMERCE</p>
        <h1>Pesanan Saya</h1>
        <p>Lihat dan pantau semua pesanan kamu di satu tempat.</p>
      </section>

      <section className={styles.container}>
        {errorMessage && (
          <div className={styles.errorBanner}>{errorMessage}</div>
        )}

        <p className={styles.retentionNote}>
          Pesanan disimpan {ORDER_RETENTION_DAYS} hari, setelah itu terhapus
          otomatis.
        </p>

        <div className={styles.orderSummary}>
          <div>
            <span>Total Pesanan</span>
            <h2>{orders.length}</h2>
          </div>

          <div>
            <span>Dalam Pengiriman</span>
            <h2>
              {
                orders.filter(
                  (order) => order.status === "Dalam perjalanan"
                ).length
              }
            </h2>
          </div>

          <div>
            <span>Sedang Diproses</span>
            <h2>
              {
                orders.filter(
                  (order) =>
                    order.status === "Sedang dikemas" ||
                    order.status === "Pesanan dibuat"
                ).length
              }
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
          {loading ? (
            <div className={styles.emptyState}>
              <h3>Memuat pesanan...</h3>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <article
                className={styles.orderCard}
                key={order.id}
              >
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

                {order.items.map((item, itemIndex) => (
                  <div
                    className={styles.productSection}
                    key={`${order.id}-${itemIndex}`}
                  >
                    <div className={styles.productImage}>
                      {order.image && (
                        <img src={order.image} alt={item.name} />
                      )}
                    </div>

                    <div className={styles.productDetails}>
                      <span className={styles.category}>
                        {order.category}
                      </span>

                      <h3>{item.name}</h3>

                      <p>{item.variant || "Variasi produk standar"}</p>

                      <span className={styles.quantity}>x{item.qty}</span>
                    </div>

                    <div className={styles.productPrice}>
                      <span>Harga Produk</span>
                      <strong>{formatPrice(item.price)}</strong>
                    </div>
                  </div>
                ))}

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
                    <strong>
                      {formatPrice(
                        order.items.reduce(
                          (sum, item) => sum + item.price * item.qty,
                          0
                        )
                      )}
                    </strong>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button
                    type="button"
                    className={styles.detailButton}
                    onClick={() => toggleDetails(order.id)}
                  >
                    {expandedOrder === order.id
                      ? "Tutup Detail"
                      : "Lihat Detail Pesanan"}
                    <span>
                      {expandedOrder === order.id ? "−" : "+"}
                    </span>
                  </button>
                </div>

                {expandedOrder === order.id && (
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
