
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminProducts,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  type AdminProduct,
  type AdminProductInput,
} from "@/lib/adminProducts";

const initialForm: AdminProductInput = {
  name: "",
  category: "",
  price: 0,
  image: "",
  description: "",
};

export default function AdminProdukPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductInput>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data produk dari Firestore.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(
    () => [
      "Semua",
      ...Array.from(new Set(products.map((p) => p.category))),
    ],
    [products]
  );

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword);

    const matchesCategory =
      category === "Semua" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function handleFormChange(
    field: keyof AdminProductInput,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: field === "price" ? Number(value) : value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product: AdminProduct) {
    setEditingId(product.docId);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.image.trim() ||
      !form.description.trim()
    ) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (!Number.isFinite(form.price) || form.price <= 0) {
      setError("Harga harus lebih besar dari 0.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateAdminProduct(editingId, form);
        setSuccess("Produk berhasil diperbarui.");
      } else {
        await addAdminProduct(form);
        setSuccess("Produk berhasil ditambahkan.");
      }

      closeForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan produk. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus produk "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteAdminProduct(product.docId);
      setSuccess(`Produk "${product.name}" berhasil dihapus.`);
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus produk.");
    }
  }

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manajemen Produk</h1>
          <p className="text-muted mb-0">
            Kelola katalog produk Digeboy.
          </p>
        </div>

        <button className="btn btn-success" onClick={openAddForm}>
          + Tambah Produk
        </button>
      </div>

      {error && !showForm && (
        <div className="alert alert-danger">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              {editingId ? "Edit Produk" : "Tambah Produk Baru"}
            </h5>

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Nama Produk</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) =>
                      handleFormChange("name", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Kategori</label>
                  <input
                    className="form-control"
                    value={form.category}
                    onChange={(e) =>
                      handleFormChange("category", e.target.value)
                    }
                    placeholder="Contoh: Audio"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Harga (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.price || ""}
                    onChange={(e) =>
                      handleFormChange("price", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">URL / Path Gambar</label>
                  <input
                    className="form-control"
                    value={form.image}
                    onChange={(e) =>
                      handleFormChange("image", e.target.value)
                    }
                    placeholder="/images/produk.jpg"
                    required
                  />
                  <small className="text-muted">
                    Gunakan path gambar lokal atau URL gambar.
                  </small>
                </div>

                <div className="col-12">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Produk"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label">Cari Produk</label>
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama atau kategori produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
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
            <h5 className="fw-bold mb-0">Daftar Produk</h5>
            <span className="text-muted small">
              {filteredProducts.length} produk
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              Memuat produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">
                Belum ada produk di database Admin.
              </p>
              <p className="small text-muted mb-0">
                Produk katalog lama belum otomatis masuk ke Firestore.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.docId}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            width={65}
                            height={65}
                            style={{
                              objectFit: "contain",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "8px",
                            }}
                          />
                          <div className="fw-semibold">
                            {product.name}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-secondary">
                          {product.category}
                        </span>
                      </td>

                      <td className="fw-semibold text-success">
                        {formatRupiah(product.price)}
                      </td>

                      <td>
                        <span className="small text-muted">
                          {product.description}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openEditForm(product)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(product)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
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
