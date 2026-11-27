
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import CategoryList from "@/components/CategoryList";
import ProductList from "@/components/ProductList";
import CartButton from "@/components/CartButton";
import { useCart } from "@/components/CartContext";
import { PRODUCTS, type Product } from "@/lib/products";

export default function ProdukPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");

  const { addToCart } = useCart();

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const minimumPrice =
      minPrice === "" ? 0 : Number(minPrice);

    const maximumPrice =
      maxPrice === "" ? Infinity : Number(maxPrice);

    const ratingThreshold = Number(minRating);

    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);

      const matchesPrice =
        product.price >= minimumPrice &&
        product.price <= maximumPrice;

      const matchesRating =
        product.rating >= ratingThreshold;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesRating
      );
    });
  }, [search, selectedCategory, minPrice, maxPrice, minRating]);

  function handleAddToCart(product: Product) {
    addToCart(product);
  }

  function handleResetFilters() {
    setSearch("");
    setSelectedCategory("Semua");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("0");
  }

  const hasActiveFilters =
    search !== "" ||
    selectedCategory !== "Semua" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating !== "0";

  return (
    <main className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <Link
            href="/"
            className="text-decoration-none text-success fw-semibold"
          >
            ← Kembali ke Dashboard
          </Link>

          <h1 className="fw-bold mt-3">
            Jelajahi Produk
          </h1>

          <p className="text-muted mb-0">
            Cari dan filter produk sesuai kebutuhanmu.
          </p>
        </div>

        <CartButton />
      </div>

      {/* Pencarian */}
      <section className="mb-4">
        <label
          htmlFor="product-search"
          className="form-label fw-semibold"
        >
          Cari Produk
        </label>

        <div className="input-group">
          <input
            id="product-search"
            type="text"
            className="form-control form-control-lg"
            placeholder="Cari nama, kategori, atau deskripsi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search !== "" && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setSearch("")}
            >
              Hapus
            </button>
          )}
        </div>
      </section>

      {/* Filter Harga dan Rating */}
      <section className="card shadow-sm border-0 p-3 p-md-4 mb-4">
        <h5 className="fw-bold mb-3">
          Filter Produk
        </h5>

        <div className="row g-3">
          {/* Harga Minimum */}
          <div className="col-12 col-md-4">
            <label
              htmlFor="min-price"
              className="form-label"
            >
              Harga Minimum (Rp)
            </label>

            <input
              id="min-price"
              type="number"
              min="0"
              className="form-control"
              placeholder="Contoh: 50000"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </div>

          {/* Harga Maksimum */}
          <div className="col-12 col-md-4">
            <label
              htmlFor="max-price"
              className="form-label"
            >
              Harga Maksimum (Rp)
            </label>

            <input
              id="max-price"
              type="number"
              min="0"
              className="form-control"
              placeholder="Contoh: 200000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>

          {/* Rating */}
          <div className="col-12 col-md-4">
            <label
              htmlFor="min-rating"
              className="form-label"
            >
              Rating Minimum
            </label>

            <select
              id="min-rating"
              className="form-select"
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
            >
              <option value="0">Semua Rating</option>
              <option value="4">4 bintang ke atas</option>
              <option value="4.5">4.5 bintang ke atas</option>
              <option value="4.7">4.7 bintang ke atas</option>
              <option value="4.8">4.8 bintang ke atas</option>
            </select>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hasil Filter */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-3">
        <p className="text-muted mb-0">
          {filteredProducts.length} produk ditemukan
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleResetFilters}
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* Daftar Produk */}
      <ProductList
        products={filteredProducts}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}
