
"use client";

import { useMemo, useState } from "react";
import DashboardBanner from "@/components/DashboardBanner";
import CategoryList from "@/components/CategoryList";
import ProductList from "@/components/ProductList";
import CartButton from "@/components/CartButton";
import { useCart } from "@/components/CartContext";
import { PRODUCTS, type Product } from "@/lib/products";
import FlashSaleBanner from "@/components/FlashSaleBanner";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const { addToCart } = useCart();

  const filteredProducts = useMemo(() => {
    const searchKeyword = search.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchKeyword) ||
        product.category.toLowerCase().includes(searchKeyword) ||
        product.description.toLowerCase().includes(searchKeyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  function handleAddToCart(product: Product) {
    addToCart(product);
  }

  function handleResetSearch() {
    setSearch("");
    setSelectedCategory("Semua");
  }

  return (
    <main className="container py-4">
      {/* Header Homepage */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div>
          <p className="text-muted mb-0">
            Selamat berbelanja di Digeboy.
          </p>
        </div>

        <CartButton />
      </div>

      {/* Flash Sale Banner */}
      <div className="mb-4">
        <FlashSaleBanner />
      </div>

      {/* Dashboard Banner */}
      <DashboardBanner />

      {/* Pencarian Produk */}
      <div className="mb-4 mt-4">
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

          {search && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setSearch("")}
            >
              Hapus
            </button>
          )}
        </div>

        <small className="text-muted mt-2 d-block">
          Cari produk berdasarkan nama, kategori, atau deskripsi.
        </small>
      </div>

      {/* Kategori */}
      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Produk */}
      <ProductList
        products={filteredProducts}
        onAddToCart={handleAddToCart}
      />

      {/* Reset */}
      {search || selectedCategory !== "Semua" ? (
        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleResetSearch}
          >
            Reset Pencarian dan Kategori
          </button>
        </div>
      ) : null}
    </main>
  );
}
