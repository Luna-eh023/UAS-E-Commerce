"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import OrderCard from "@/components/OrderCard";
import {
  Order,
  OrderStatus,
  STATUS_FLOW,
  STATUS_LABEL,
  advanceStatus,
  backfillStoreLogos,
  buyAgain,
  formatRupiah,
  getOrders,
  refundOrder,
  seedOrders,
  submitReview,
} from "@/lib/orders";

type Filter = "semua" | OrderStatus;

type ToastState = {
  show: boolean;
  message: string;
  variant: "success" | "danger";
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");

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

    getOrders()
  .then(backfillStoreLogos)
  .then((data) => {
    if (active) setOrders(data);
  })
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
    setOrders(await getOrders());
  };

  const showToast = (message: string, variant: "success" | "danger") => {
    setToast({ show: true, message, variant });
  };

  const run = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      await refresh();
      showToast(successMessage, "success");
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan, coba lagi.", "danger");
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

  const openReview = (order: Order) => {
    setReviewTarget(order);
    setRating(0);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget) return;
    if (rating === 0) {
      showToast("Pilih jumlah bintang dulu.", "danger");
      return;
    }
    const target = reviewTarget;
    setReviewTarget(null);
    await run(
      () => submitReview(target.id, rating, comment),
      "Ulasan berhasil dikirim."
    );
  };

  const handleConfirmRefund = async () => {
    if (!refundTarget) return;
    const target = refundTarget;
    setRefundTarget(null);
    await run(() => refundOrder(target.id), "Pengajuan pengembalian dana berhasil.");
  };

  const visibleOrders =
    filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  const countOf = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 fw-bold mb-0">Status Pesanan</h1>
        <Link
          href="/notifikasi"
          className="btn btn-outline-primary rounded-pill px-3"
        >
          Notifikasi
        </Link>
      </div>
      <Nav
        variant="pills"
        className="flex-nowrap overflow-auto bg-body rounded shadow-sm p-2 mb-3"
        activeKey={filter}
        onSelect={(key) => setFilter((key ?? "semua") as Filter)}
      >
        <Nav.Item>
          <Nav.Link eventKey="semua" className="text-nowrap">
            Semua ({orders.length})
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
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">Belum ada pesanan.</p>
          <Button variant="primary" onClick={handleSeed}>
            Buat Data Contoh
          </Button>
        </div>
      )}

      {!loading && orders.length > 0 && visibleOrders.length === 0 && (
        <p className="text-muted text-center py-4">
          Tidak ada pesanan dengan status ini.
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
        />
      ))}

      <Modal show={reviewTarget !== null} onHide={() => setReviewTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tulis Ulasan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-2">{reviewTarget?.storeName}</p>
          <div className="mb-3" aria-label="Pilih bintang">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="btn btn-link p-0 me-1 fs-2 text-decoration-none text-warning"
                onClick={() => setRating(star)}
                aria-label={`${star} bintang`}
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
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setReviewTarget(null)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmitReview}>
            Kirim Ulasan
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={refundTarget !== null} onHide={() => setRefundTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Kembalikan Dana</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ajukan pengembalian dana sebesar{" "}
          <b>{refundTarget ? formatRupiah(refundTarget.total) : ""}</b> untuk
          pesanan dari <b>{refundTarget?.storeName}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRefundTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleConfirmRefund}>
            Ya, Kembalikan Dana
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3" style={{ position: "fixed" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  );
}
