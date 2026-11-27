
"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PRODUCTS, type Product } from "@/lib/products";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthProvider";
import { useWishlist } from "@/components/WishlistContext";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="mb-3">
      <span className="text-warning">
        {"★".repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? "½" : ""}
      </span>

      <span className="text-muted ms-2">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);
  const product = PRODUCTS.find((item) => item.id === id);

  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);

  if (!product) {
    return (
      <main className="container py-5">
        <div className="text-center py-5">
          <h2 className="fw-bold">Produk tidak ditemukan</h2>

          <p className="text-muted">
            Produk yang kamu cari tidak tersedia.
          </p>

          <Link href="/" className="btn btn-success">
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const productId = product.id;
  const favorite = isWishlisted(productId);

  function handleAddToCart(selectedProduct: Product) {
    setMessage("");
    setError("");

    try {
      addToCart(selectedProduct);
      setMessage("Produk berhasil ditambahkan ke keranjang.");
    } catch (err) {
      console.error(err);
      setError("Gagal menambahkan produk ke keranjang.");
    }
  }

  async function handleWishlist() {
    setMessage("");
    setError("");

    if (authLoading) return;

    if (!user) {
      setError("Login terlebih dahulu untuk menggunakan wishlist.");
      return;
    }

    setWishlistLoading(true);

    try {
      await toggleWishlist(productId);

      setMessage(
        favorite
          ? "Produk dihapus dari wishlist."
          : "Produk ditambahkan ke wishlist."
      );
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <main className="container py-4 py-md-5">
      {/* Tombol Kembali */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => router.back()}
        >
          ← Kembali
        </button>
      </div>

      {/* Notifikasi */}
      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}

          {!user && !authLoading && (
            <Link href="/login" className="ms-2">
              Login
            </Link>
          )}
        </div>
      )}

      <div className="row g-4 g-lg-5">
        {/* Gambar */}
        <div className="col-12 col-md-6">
          <div className="bg-body-tertiary rounded-4 p-3 p-md-4">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              priority
              className="w-100"
              style={{
                objectFit: "contain",
                height: "400px",
              }}
            />
          </div>
        </div>

        {/* Informasi Produk */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column h-100">
            <span className="badge text-bg-light align-self-start mb-3">
              {product.category}
            </span>

            <h1 className="fw-bold mb-3">
              {product.name}
            </h1>

            <RatingStars rating={product.rating} />

            <p className="text-muted small mb-3">
              {product.reviewCount} ulasan
            </p>

            <h3 className="text-success fw-bold mb-4">
              {formatRupiah(product.price)}
            </h3>

            <hr />

            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                Nama Toko
              </h5>

              <p className="mb-0">
                {product.storeName}
              </p>
            </div>

            <hr />

            <h5 className="fw-bold mb-2">
              Deskripsi Produk
            </h5>

            <p className="text-muted mb-4">
              {product.description}
            </p>

            {/* Tombol */}
            <div className="mt-auto d-grid gap-3">
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={() => handleAddToCart(product)}
              >
                + Tambah ke Keranjang
              </button>

              <button
                type="button"
                className={`btn btn-lg ${
                  favorite
                    ? "btn-outline-danger"
                    : "btn-outline-secondary"
                }`}
                onClick={handleWishlist}
                disabled={wishlistLoading || authLoading}
              >
                {wishlistLoading
                  ? "Memproses..."
                  : favorite
                    ? "♥ Hapus dari Wishlist"
                    : "♡ Tambah ke Wishlist"}
              </button>

              <Link
                href="/cart"
                className="btn btn-outline-success"
              >
                Lihat Keranjang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
