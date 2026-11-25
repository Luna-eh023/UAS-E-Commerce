
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getOrders,
  formatRupiah,
  STATUS_FLOW,
  STATUS_LABEL,
  type Order,
} from "@/lib/orders";

export default function AdminLaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const validOrders = orders.filter((order) => !order.refunded);

    return {
      totalOrders: orders.length,
      totalRevenue: validOrders.reduce(
        (sum, order) => sum + order.total,
        0
      ),
      completedOrders: orders.filter(
        (order) => order.status === "sampai"
      ).length,
      refundedOrders: orders.filter(
        (order) => order.refunded
      ).length,
    };
  }, [orders]);

  const monthlyData = useMemo(() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        }),
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach((order) => {
      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime()) || order.refunded) return;

      const monthData = months.find(
        (item) =>
          item.month === date.getMonth() &&
          item.year === date.getFullYear()
      );

      if (monthData) {
        monthData.revenue += order.total;
        monthData.orders += 1;
      }
    });

    return months;
  }, [orders]);

  const maxRevenue = Math.max(
    ...monthlyData.map((item) => item.revenue),
    1
  );

  const statusData = useMemo(() => {
    return STATUS_FLOW.map((status) => ({
      status,
      label: STATUS_LABEL[status],
      total: orders.filter((order) => order.status === status).length,
    }));
  }, [orders]);

  const recentOrders = orders.slice(0, 10);

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Laporan</h1>
          <p className="text-muted mb-0">
            Ringkasan performa transaksi Digeboy.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Refresh Laporan"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="mt-2">Memuat laporan...</p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Total Pesanan</p>
                  <h3 className="fw-bold">{stats.totalOrders}</h3>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Total Omzet</p>
                  <h5 className="fw-bold text-success">
                    {formatRupiah(stats.totalRevenue)}
                  </h5>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Pesanan Selesai</p>
                  <h3 className="fw-bold text-success">
                    {stats.completedOrders}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Pesanan Refund</p>
                  <h3 className="fw-bold text-danger">
                    {stats.refundedOrders}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">
                    Omzet 6 Bulan Terakhir
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    {monthlyData.map((month) => (
                      <div key={`${month.year}-${month.month}`}>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-semibold">
                            {month.label}
                          </span>
                          <span className="text-success fw-semibold">
                            {formatRupiah(month.revenue)}
                          </span>
                        </div>

                        <div
                          className="progress"
                          style={{ height: "20px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${
                                (month.revenue / maxRevenue) * 100
                              }%`,
                            }}
                            aria-valuenow={month.revenue}
                            aria-valuemin={0}
                            aria-valuemax={maxRevenue}
                          />
                        </div>

                        <small className="text-muted">
                          {month.orders} transaksi
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">
                    Ringkasan Status Pesanan
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    {statusData.map((item) => (
                      <div key={item.status}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{item.label}</span>
                          <span className="fw-bold">
                            {item.total}
                          </span>
                        </div>

                        <div
                          className="progress"
                          style={{ height: "8px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: `${
                                stats.totalOrders > 0
                                  ? (item.total / stats.totalOrders) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                10 Transaksi Terbaru
              </h5>

              {recentOrders.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Belum ada transaksi.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID Pesanan</th>
                        <th>Penerima</th>
                        <th>Tanggal</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <small className="text-muted">
                              {order.id.slice(0, 8)}
                            </small>
                          </td>

                          <td>
                            {order.recipientName || "-"}
                          </td>

                          <td>
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString("id-ID")}
                          </td>

                          <td className="fw-semibold">
                            {formatRupiah(order.total)}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                order.refunded
                                  ? "bg-danger"
                                  : order.status === "sampai"
                                    ? "bg-success"
                                    : "bg-secondary"
                              }`}
                            >
                              {order.refunded
                                ? "Refund"
                                : STATUS_LABEL[order.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
