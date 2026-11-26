
"use client";

import DashboardBanner from "@/components/DashboardBanner";
import CartButton from "@/components/CartButton";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import ProductList from "@/components/ProductList";
import { PRODUCTS, type Product } from "@/lib/products";
import { useCart } from "@/components/CartContext";

export default function Home() {
  const { addToCart } = useCart();

  function handleAddToCart(product: Product) {
    addToCart(product);
  }

  return (
    <main className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div>
          <p className="text-muted mb-0">
            Selamat berbelanja di Digeboy.
          </p>
        </div>

        <CartButton />
      </div>

      {/* Flash Sale */}
      <div className="mb-4">
        <FlashSaleBanner />
      </div>

      {/* Dashboard Banner */}
      <DashboardBanner />

      {/* Etalase Produk */}
      <section className="mt-4">
        <div className="mb-4">
          <h2 className="fw-bold">Produk Pilihan</h2>

          <p className="text-muted">
            Temukan berbagai produk menarik di Digeboy.
          </p>
        </div>

        <ProductList
          products={PRODUCTS}
          onAddToCart={handleAddToCart}
        />
      </section>
    </main>
  );
}
