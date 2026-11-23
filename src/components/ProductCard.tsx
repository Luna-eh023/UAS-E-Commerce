import Image from "next/image";
import type { Product } from "@/lib/products";

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
  return (
    <div className="card h-100 border-0 shadow-sm product-card">
      <div className="position-relative bg-body-tertiary rounded-top overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={300}
          className="w-100 product-image"
          style={{ objectFit: "contain" }}
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

        <div className="mt-auto">
          <p className="fw-bold text-success mb-3">
            {formatRupiah(product.price)}
          </p>

          <button
            type="button"
            className="btn btn-success w-100"
            onClick={() => onAddToCart(product)}
          >
            + Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}