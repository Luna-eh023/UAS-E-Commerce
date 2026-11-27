
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import NotificationBell from "@/components/NotificationBell";
import OrderCard from "@/components/OrderCard";
import {
  Order,
  OrderStatus,
  STATUS_FLOW,
  STATUS_LABEL,
  advanceStatus,
  backfillStoreLogos,
  buyAgain,
  canRefund,
  formatRupiah,
  getOrders,
  refundOrder,
  seedOrders,
  submitReview,
} from "@/lib/orders";

// Deklarasi global window.snap (dari Midtrans Snap.js)
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type Filter = "semua" | OrderStatus;

type ToastState = {
  show: boolean;
  message: string;
  variant: "success" | "danger";
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [search, setSearch] = useState("");
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  void payingOrder; // consumed by handlePay callbacks

  const [reviewTarget, setReviewTarget] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [refundTarget, setRefundTarget] = useState<Order | null>(null);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      const successOrderId = new URLSearchParams(window.location.search).get(
        "success"
      );

      if (successOrderId) {
        try {
          const response = await fetch("/api/orders/sync-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: successOrderId }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Status pembayaran belum tersinkron.");
          }
        } catch (err) {
          console.error("Gagal menyinkronkan pembayaran:", err);
          if (active) {
            showToast(
              "Pembayaran berhasil, tetapi status pesanan belum tersinkron. Coba muat ulang halaman.",
              "danger"
            );
          }
        }
      }

      const data = await getOrders().then(backfillStoreLogos);
      if (active) setOrders(data);
    };

    loadOrders()
      .catch((err) => {
        console.error(err);

        if (active) {
          setError(
            "Gagal memuat pesanan. Periksa konfigurasi Firebase dan aturan Firestore."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refresh = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  const showToast = (message: string, variant: "success" | "danger") => {
    setToast({ show: true, message, variant });
  };

  const run = async (
    action: () => Promise<void>,
    successMessage: string
  ): Promise<boolean> => {
    if (busy) return false;

    setBusy(true);

    try {
      await action();
      await refresh();
      showToast(successMessage, "success");
      return true;
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan, coba lagi.", "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleSeed = () =>
    run(seedOrders, "Data contoh berhasil dibuat.");

  const handleAdvance = (order: Order) =>
    run(() => advanceStatus(order), "Status pesanan diperbarui.");

  const handleBuyAgain = (order: Order) =>
    run(
      () => buyAgain(order),
      "Pesanan baru dibuat dan masuk ke tab Di Gudang."
    );

  // --- Bayar ulang pesanan Midtrans pending ---
  const handlePay = (order: Order) => {
    if (!order.snapToken) return;
    setPayingOrder(order);

    if (!window.snap) {
      showToast("Snap.js belum siap, muat ulang halaman.", "danger");
      setPayingOrder(null);
      return;
    }

    window.snap.pay(order.snapToken, {
      onSuccess: async () => {
        // Sinkronisasi status ke Firestore via API
        await fetch("/api/orders/sync-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        }).catch(console.error);
        await refresh();
        showToast("Pembayaran berhasil! Pesanan diproses.", "success");
        setPayingOrder(null);
      },
      onPending: async () => {
        await refresh();
        showToast("Pembayaran masih menunggu konfirmasi.", "success");
        setPayingOrder(null);
      },
      onError: () => {
        showToast("Pembayaran gagal. Coba lagi.", "danger");
        setPayingOrder(null);
      },
      onClose: () => {
        setPayingOrder(null);
      },
    });
  };

  const openReview = (order: Order) => {
    if (busy) return;

    setReviewTarget(order);
    setRating(0);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget || busy) return;

    if (rating === 0) {
      showToast("Pilih jumlah bintang dulu.", "danger");
      return;
    }

    const target = reviewTarget;

    const success = await run(
      () => submitReview(target.id, rating, comment),
      "Ulasan berhasil dikirim."
    );

    if (success) {
      setReviewTarget(null);
      setRating(0);
      setComment("");
    }
  };

  const handleConfirmRefund = async () => {
    if (!refundTarget || busy) return;

    const target = refundTarget;

    if (!canRefund(target)) {
      setRefundTarget(null);
      showToast(
        "Pesanan tidak memenuhi syarat pengembalian dana.",
        "danger"
      );
      await refresh().catch(console.error);
      return;
    }

    const success = await run(
      () => refundOrder(target.id),
      "Pengajuan pengembalian dana berhasil."
    );

    if (success) {
      setRefundTarget(null);
    }
  };

  const keyword = search.trim().toLowerCase();

  const searched =
    keyword === ""
      ? orders
      : orders.filter(
          (o) =>
            o.storeName.toLowerCase().includes(keyword) ||
            o.items.some((item) =>
              item.name.toLowerCase().includes(keyword)
            )
        );

  const visibleOrders =
    filter === "semua"
      ? searched
      : searched.filter((o) => o.status === filter);

  const countOf = (status: OrderStatus) =>
    searched.filter((o) => o.status === status).length;

  const SNAP_JS_URL =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <>
      <Script
        src={SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <main className="container py-4">
      <div className="input-group input-group-lg mb-4 shadow-sm rounded-pill">
        <span className="input-group-text bg-body rounded-start-pill ps-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          type="text"
          className={`form-control ${
            search === "" ? "rounded-end-pill" : ""
          }`}
          placeholder="Cari pesanan Anda (nama toko atau barang)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari pesanan"
        />

        {search !== "" && (
          <button
            type="button"
            className="btn btn-outline-secondary rounded-end-pill px-3"
            onClick={() => setSearch("")}
            disabled={busy}
          >
            Hapus
          </button>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 fw-bold mb-0">Status Pesanan</h1>
        <NotificationBell />
      </div>

      <Nav
        variant="pills"
        className="flex-nowrap overflow-auto bg-body rounded shadow-sm p-2 mb-3"
        activeKey={filter}
        onSelect={(key) => setFilter((key ?? "semua") as Filter)}
      >
        <Nav.Item>
          <Nav.Link eventKey="semua" className="text-nowrap">
            Semua ({searched.length})
          </Nav.Link>
        </Nav.Item>

        {STATUS_FLOW.map((status) => (
          <Nav.Item key={status}>
            <Nav.Link eventKey={status} className="text-nowrap">
              {STATUS_LABEL[status]} ({countOf(status)})
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="text-muted mt-2">Memuat pesanan...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">Belum ada pesanan.</p>

          <Button
            variant="primary"
            onClick={handleSeed}
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner size="sm" className="me-2" />
                Membuat data...
              </>
            ) : (
              "Buat Data Contoh"
            )}
          </Button>
        </div>
      )}

      {!loading && orders.length > 0 && visibleOrders.length === 0 && (
        <p className="text-muted text-center py-4">
          {keyword === ""
            ? "Tidak ada pesanan dengan status ini."
            : `Tidak ada pesanan yang cocok dengan "${search.trim()}".`}
        </p>
      )}

      {visibleOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onAdvance={handleAdvance}
          onReview={openReview}
          onBuyAgain={handleBuyAgain}
          onRefund={setRefundTarget}
          onPay={handlePay}
        />
      ))}

      {/* Modal Review */}
      <Modal
        show={reviewTarget !== null}
        onHide={() => {
          if (!busy) setReviewTarget(null);
        }}
        centered
      >
        <Modal.Header closeButton={!busy}>
          <Modal.Title>Tulis Ulasan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small mb-2">
            {reviewTarget?.storeName}
          </p>

          <div className="mb-3" aria-label="Pilih bintang">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="btn btn-link p-0 me-1 fs-2 text-decoration-none text-warning"
                onClick={() => setRating(star)}
                aria-label={`${star} bintang`}
                disabled={busy}
              >
                {star <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>

          <Form.Group>
            <Form.Label>Komentar (opsional)</Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman belanja kamu..."
              disabled={busy}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setReviewTarget(null)}
            disabled={busy}
          >
            Batal
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmitReview}
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner size="sm" className="me-2" />
                Mengirim...
              </>
            ) : (
              "Kirim Ulasan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Refund */}
      <Modal
        show={refundTarget !== null}
        onHide={() => {
          if (!busy) setRefundTarget(null);
        }}
        centered
      >
        <Modal.Header closeButton={!busy}>
          <Modal.Title>Kembalikan Dana</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Ajukan pengembalian dana sebesar{" "}
          <b>
            {refundTarget
              ? formatRupiah(refundTarget.total)
              : ""}
          </b>{" "}
          untuk pesanan dari{" "}
          <b>{refundTarget?.storeName}</b>?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setRefundTarget(null)}
            disabled={busy}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            onClick={handleConfirmRefund}
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner size="sm" className="me-2" />
                Memproses...
              </>
            ) : (
              "Ya, Kembalikan Dana"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer
        position="bottom-end"
        className="p-3"
        style={{ position: "fixed" }}
      >
        <Toast
          show={toast.show}
          onClose={() =>
            setToast((prev) => ({ ...prev, show: false }))
          }
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
    </>
  );
}
