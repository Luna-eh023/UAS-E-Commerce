"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCTS, type Product } from "@/lib/products";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthProvider";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    productIds,
    loading,
    error,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const wishlistProducts = PRODUCTS.filter((product) =>
    productIds.includes(product.id)
  );

  async function handleRemove(productId: number) {
    setActionLoading(productId);
    setMessage("");
    setActionError("");

    try {
      await removeFromWishlist(productId);
      setMessage("Produk berhasil dihapus dari wishlist.");
    } catch (error) {
      console.error(error);
      setActionError("Gagal menghapus produk dari wishlist.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleAddToCart(product: Product) {
    setMessage("");
    setActionError("");

    try {
      addToCart(product);
      setMessage(`${product.name} ditambahkan ke keranjang.`);
    } catch (error) {
      console.error(error);
      setActionError("Gagal menambahkan produk ke keranjang.");
    }
  }

  if (authLoading) {
    return (
      <main className="container py-5 text-center">
        <p className="text-muted">Memuat akun...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container py-5">
        <div className="text-center py-5 bg-body-tertiary rounded-4">
          <h2 className="fw-bold mb-3">Wishlist</h2>

          <p className="text-muted">
            Login terlebih dahulu untuk melihat wishlist.
          </p>

          <Link href="/login" className="btn btn-success">
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <p className="text-muted">Memuat wishlist...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Wishlist</h2>

          <p className="text-muted mb-0">
            Produk yang kamu simpan untuk nanti.
          </p>
        </div>

        <Link
          href="/"
          className="btn btn-outline-success"
        >
          Jelajahi Produk
        </Link>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger">
          {actionError}
        </div>
      )}

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-5 bg-body-tertiary rounded-4">
          <h4 className="fw-bold mb-2">
            Wishlist masih kosong
          </h4>

          <p className="text-muted mb-4">
            Simpan produk favoritmu agar mudah ditemukan kembali.
          </p>

          <Link href="/" className="btn btn-success">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <span className="text-muted">
              {wishlistProducts.length} produk tersimpan
            </span>
          </div>

          <div className="row g-3 g-md-4">
            {wishlistProducts.map((product) => (
              <div
                className="col-6 col-md-4 col-xl-3"
                key={product.id}
              >
                <div className="card h-100 border-0 shadow-sm">
                  <div className="bg-body-tertiary rounded-top p-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-100"
                      style={{
                        height: "200px",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <div className="card-body d-flex flex-column">
                    <span className="badge text-bg-light align-self-start mb-2">
                      {product.category}
                    </span>

                    <h6 className="fw-semibold mb-2">
                      {product.name}
                    </h6>

                    <p className="text-muted small mb-3">
                      {product.description}
                    </p>

                    <p className="fw-bold text-success mb-3">
                      {formatRupiah(product.price)}
                    </p>

                    <div className="mt-auto d-grid gap-2">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleAddToCart(product)}
                      >
                        Tambah ke Keranjang
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemove(product.id)}
                        disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id
                          ? "Menghapus..."
                          : "Hapus dari Wishlist"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}