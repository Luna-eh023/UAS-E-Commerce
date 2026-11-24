"use client";

import { useEffect, useState } from "react";
import { getOrders, formatRupiah, type Order } from "@/lib/orders";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Gagal memuat pesanan:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const totalRevenue = orders
    .filter((order) => !order.refunded)
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status !== "sampai"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "sampai"
  ).length;

  return (
    <main className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold">Admin Dashboard</h1>
        <p className="text-muted">
          Ringkasan aktivitas dan penjualan Digeboy.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <p>Memuat data dashboard...</p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-2">Total Pesanan</p>
                  <h3 className="fw-bold">{totalOrders}</h3>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-2">Total Pendapatan</p>
                  <h3 className="fw-bold text-success">
                    {formatRupiah(totalRevenue)}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-2">Pesanan Berjalan</p>
                  <h3 className="fw-bold text-warning">
                    {pendingOrders}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-2">Pesanan Selesai</p>
                  <h3 className="fw-bold text-primary">
                    {completedOrders}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Pesanan Terbaru</h5>

              {orders.length === 0 ? (
                <p className="text-muted mb-0">
                  Belum ada data pesanan.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Penerima</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td>
                            <span className="small">
                              {order.id.slice(0, 8)}
                            </span>
                          </td>
                          <td>
                            {order.recipientName || order.storeName}
                          </td>
                          <td>{formatRupiah(order.total)}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
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
