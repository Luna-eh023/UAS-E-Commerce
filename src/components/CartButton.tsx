"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartButton() {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="btn btn-outline-success position-relative"
    >
      <span className="me-2">🛒</span>
      Keranjang

      {cartCount > 0 && (
        <span className="badge bg-danger ms-2">
          {cartCount}
        </span>
      )}
    </Link>
  );
}