
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrders, formatRupiah, type Order } from "@/lib/orders";

type Customer = {
  key: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
};

export default function AdminCustomerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data customer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const name = order.recipientName?.trim() || "Customer";
      const phone = order.phoneNumber?.trim() || "-";
      const address = order.shippingAddress?.trim() || "-";
      const key = phone !== "-" ? phone : name.toLowerCase();

      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        if (!order.refunded) {
          existing.totalSpent += order.total;
        }

        if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = order.createdAt;
          existing.name = name;
          existing.address = address;
        }
      } else {
        customerMap.set(key, {
          key,
          name,
          phone,
          address,
          totalOrders: 1,
          totalSpent: order.refunded ? 0 : order.total,
          lastOrder: order.createdAt,
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) =>
        new Date(b.lastOrder).getTime() -
        new Date(a.lastOrder).getTime()
    );
  }, [orders]);

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(keyword) ||
      customer.phone.toLowerCase().includes(keyword) ||
      customer.address.toLowerCase().includes(keyword)
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manajemen Customer</h1>
          <p className="text-muted mb-0">
            Data pelanggan berdasarkan riwayat pesanan.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Refresh Data"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Customer</p>
              <h3 className="fw-bold">{customers.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Pesanan</p>
              <h3 className="fw-bold">{orders.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label fw-semibold">
            Cari Customer
          </label>
          <input
            className="form-control"
            placeholder="Cari nama, nomor telepon, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Daftar Customer</h5>
            <small className="text-muted">
              {filteredCustomers.length} customer
            </small>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" />
              <p className="mt-2">Memuat data customer...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center text-muted py-5">
              Tidak ada customer ditemukan.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Telepon</th>
                    <th>Alamat Terakhir</th>
                    <th>Pesanan</th>
                    <th>Total Belanja</th>
                    <th>Pesanan Terakhir</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.key}>
                      <td className="fw-semibold">{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td style={{ minWidth: "200px" }}>
                        {customer.address}
                      </td>
                      <td>{customer.totalOrders}</td>
                      <td className="text-success fw-semibold">
                        {formatRupiah(customer.totalSpent)}
                      </td>
                      <td>{formatDate(customer.lastOrder)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
