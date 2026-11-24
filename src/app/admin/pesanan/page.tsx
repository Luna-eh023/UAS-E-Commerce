
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getOrders,
  advanceStatus,
  formatRupiah,
  STATUS_FLOW,
  STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

const STATUS_OPTIONS: (OrderStatus | "semua")[] = [
  "semua",
  ...STATUS_FLOW,
];

export default function AdminPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "semua">(
    "semua"
  );
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pesanan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleUpdateStatus(order: Order) {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];

    if (!nextStatus) return;

    const confirmed = window.confirm(
      `Ubah status pesanan menjadi "${STATUS_LABEL[nextStatus]}"?`
    );

    if (!confirmed) return;

    setUpdatingId(order.id);
    setError("");
    setSuccess("");

    try {
      await advanceStatus(order);
      await loadOrders();
      setSuccess(
        `Status pesanan ${order.id.slice(0, 8)} berhasil diperbarui.`
      );
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui status pesanan.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "semua" || order.status === filterStatus;

    const keyword = search.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(keyword) ||
      (order.recipientName ?? "").toLowerCase().includes(keyword) ||
      order.storeName.toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status !== "sampai"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "sampai"
  ).length;
  const totalRevenue = orders
    .filter((order) => !order.refunded)
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manajemen Pesanan</h1>
          <p className="text-muted mb-0">
            Kelola dan pantau pesanan pelanggan Digeboy.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Refresh Pesanan"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Total Pesanan</p>
              <h3 className="fw-bold">{totalOrders}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Belum Selesai</p>
              <h3 className="fw-bold text-warning">{pendingOrders}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Pesanan Selesai</p>
              <h3 className="fw-bold text-success">{completedOrders}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Total Nilai Pesanan</p>
              <h5 className="fw-bold text-success">
                {formatRupiah(totalRevenue)}
              </h5>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Cari Pesanan
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Cari ID, nama penerima, toko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Filter Status
              </label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as OrderStatus | "semua"
                  )
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "semua"
                      ? "Semua Status"
                      : STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Daftar Pesanan</h5>
            <small className="text-muted">
              {filteredOrders.length} pesanan
            </small>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-success"
                role="status"
              />
              <p className="mt-2 mb-0">Memuat pesanan...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center text-muted py-5">
              Tidak ada pesanan yang ditemukan.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Penerima</th>
                    <th>Produk</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const currentIndex = STATUS_FLOW.indexOf(
                      order.status
                    );
                    const nextStatus =
                      STATUS_FLOW[currentIndex + 1];

                    return (
                      <tr key={order.id}>
                        <td>
                          <small className="text-muted">
                            {order.id.slice(0, 8)}
                          </small>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {order.recipientName || "-"}
                          </div>
                          <small className="text-muted">
                            {order.phoneNumber || "-"}
                          </small>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {order.items.length} jenis produk
                          </div>
                          <small className="text-muted">
                            {order.items
                              .map(
                                (item) =>
                                  `${item.name} (${item.qty})`
                              )
                              .join(", ")}
                          </small>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {formatRupiah(order.total)}
                          </div>
                          {order.refunded && (
                            <small className="text-danger">
                              Refund
                            </small>
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              order.status === "gudang"
                                ? "bg-secondary"
                                : order.status === "disortir"
                                  ? "bg-info text-dark"
                                  : order.status === "diantar"
                                    ? "bg-warning text-dark"
                                    : "bg-success"
                            }`}
                          >
                            {STATUS_LABEL[order.status]}
                          </span>
                        </td>

                        <td>
                          {nextStatus ? (
                            <button
                              className="btn btn-sm btn-success"
                              disabled={updatingId === order.id}
                              onClick={() =>
                                handleUpdateStatus(order)
                              }
                            >
                              {updatingId === order.id
                                ? "Memproses..."
                                : `Ke ${STATUS_LABEL[nextStatus]}`}
                            </button>
                          ) : (
                            <span className="text-success fw-semibold">
                              Selesai
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
