
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Product } from "@/lib/products";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthProvider";

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const { user, loading: authLoading } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const favorite = isWishlisted(product.id);

  async function handleWishlist() {
    setFeedback("");

    if (authLoading) return;

    if (!user) {
      setFeedback("Login terlebih dahulu untuk menyimpan wishlist.");
      return;
    }

    setWishlistLoading(true);

    try {
      await toggleWishlist(product.id);

      setFeedback(
        favorite
          ? "Produk dihapus dari wishlist."
          : "Produk ditambahkan ke wishlist."
      );
    } catch (error) {
      console.error("Wishlist error:", error);
      setFeedback("Gagal memperbarui wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <div className="card h-100 border-0 shadow-sm overflow-hidden">
      {/* Gambar */}
      <div className="position-relative bg-body-tertiary">
        <Link
          href={`/product/${product.id}`}
          className="d-block"
        >
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="w-100"
            style={{
              objectFit: "contain",
              height: "220px",
            }}
          />
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading || authLoading}
          aria-label={
            favorite
              ? "Hapus dari wishlist"
              : "Tambah ke wishlist"
          }
          className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
          style={{
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          <span
            style={{
              color: favorite ? "#dc3545" : "#6c757d",
            }}
          >
            {favorite ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {/* Informasi */}
      <div className="card-body d-flex flex-column">
        {/* Nama */}
        <Link
          href={`/product/${product.id}`}
          className="text-decoration-none text-body"
        >
          <h6 className="fw-semibold mb-2">
            {product.name}
          </h6>
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <span className="text-warning">
            {"★".repeat(Math.floor(product.rating))}
            {product.rating % 1 >= 0.5 ? "½" : ""}
          </span>

          <span className="text-muted small ms-1">
            {product.rating.toFixed(1)}
            {" "}({product.reviewCount})
          </span>
        </div>

        {/* Harga */}
        <p className="fw-bold text-success mb-3">
          {formatRupiah(product.price)}
        </p>

        {/* Feedback */}
        {feedback && (
          <div className="small mb-2 text-muted">
            {feedback}

            {!user && !authLoading && (
              <Link href="/login" className="ms-1">
                Login
              </Link>
            )}
          </div>
        )}

        {/* Tombol Keranjang */}
        <button
          type="button"
          className="btn btn-success w-100 mb-2"
          onClick={() => onAddToCart(product)}
        >
          + Keranjang
        </button>

        {/* Tombol Detail */}
        <Link
          href={`/product/${product.id}`}
          className="btn btn-outline-secondary w-100"
        >
          Detail Produk
        </Link>
      </div>
    </div>
  );
}
