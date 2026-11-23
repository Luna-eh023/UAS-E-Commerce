"use client";

import { useMemo, useState } from "react";
import DashboardBanner from "@/components/DashboardBanner";
import CategoryList from "@/components/CategoryList";
import ProductList from "@/components/ProductList";
import CartButton from "@/components/CartButton";
import { useCart } from "@/components/CartContext";
import { PRODUCTS, type Product } from "@/lib/products";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const { addToCart } = useCart();

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" ||
        product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  function handleAddToCart(product: Product) {
    addToCart(product);
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>

          <p className="text-muted mb-0">
            Selamat berbelanja di Digeboy.
          </p>
        </div>

        <CartButton />
      </div>

      <DashboardBanner />

      <div className="mb-4">
        <label htmlFor="product-search" className="form-label fw-semibold">
          Cari Produk
        </label>

        <input
          id="product-search"
          type="text"
          className="form-control form-control-lg"
          placeholder="Cari nama produk..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <ProductList
        products={filteredProducts}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}