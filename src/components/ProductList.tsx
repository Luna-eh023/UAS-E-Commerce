import Link from "next/link";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

type ProductListProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export default function ProductList({
  products,
  onAddToCart,
}: ProductListProps) {
  return (
    <section id="produk">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Produk Pilihan</h4>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            {products.length} produk
          </span>

          <Link
            href="/products"
            className="text-success fw-semibold text-decoration-none small"
          >
            Lihat semua produk →
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-5 bg-body-tertiary rounded-4">
          <p className="mb-0 text-muted">
            Produk tidak ditemukan.
          </p>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {products.map((product) => (
            <div
              className="col-6 col-md-4 col-xl-3"
              key={product.id}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}