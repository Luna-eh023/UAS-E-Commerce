import Link from "next/link";
import ProductImage from "./ProductImage";
import { discountPercent, formatSold, rupiah, type Product } from "../lib/products";

export default function ProductCard({ p }: { p: Product }) {
  const off = discountPercent(p);
  return (
    <Link href={`/itemdescription/${p.id}`} className="sh-card">
      <ProductImage src={p.image} alt={p.name} className="sh-card__img" />
      <div className="sh-card__body">
        <p className="sh-card__name">{p.name}</p>
        <p className="sh-card__price">
          {rupiah(p.price)}
          {off > 0 && <span className="sh-pill">-{off}%</span>}
        </p>
        <div className="sh-tags">
          {p.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="sh-card__meta">
          <span className="sh-rate">★ {p.rating.toFixed(1)}</span>
          {formatSold(p.sold)}
        </p>
      </div>
    </Link>
  );
}
