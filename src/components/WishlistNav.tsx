"use client";

import Link from "next/link";
import { useWishlist } from "./WishlistProvider";

const badge: React.CSSProperties = {
  position: "absolute", top: -6, right: -8, minWidth: 18, height: 18, borderRadius: 9,
  background: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700,
  display: "grid", placeItems: "center", padding: "0 4px",
};

export default function WishlistNav() {
  const { items, cartCount } = useWishlist();
  return (
    <div className="d-flex align-items-center gap-3">
      <Link href="/wishlist" aria-label={`Wishlist, ${items.length} produk`} title="Wishlist"
        className="text-decoration-none text-body position-relative fs-5" style={{ lineHeight: 1 }}>
        ♡{items.length > 0 && <span style={badge}>{items.length}</span>}
      </Link>
      <span title="Keranjang" aria-label={`Keranjang, ${cartCount} produk`}
        className="position-relative fs-5" style={{ lineHeight: 1 }}>
        🛒{cartCount > 0 && <span style={{ ...badge, background: "#03ac0e" }}>{cartCount}</span>}
      </span>
    </div>
  );
}
