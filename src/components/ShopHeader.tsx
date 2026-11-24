"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartCount } from "../lib/cart";
import "./shop.css";

interface Props {
  /** Pass these to control the search box (the store page filters its products with it). */
  query?: string;
  onQueryChange?: (value: string) => void;
  /** Without onQueryChange, pressing Enter opens this store's page with the search applied. */
  storeId?: string;
  placeholder?: string;
}

export default function ShopHeader({
  query,
  onQueryChange,
  storeId,
  placeholder = "Search in this shop",
}: Props) {
  const router = useRouter();
  const [local, setLocal] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener("cart-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  const value = query ?? local;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onQueryChange) return;
    const store = storeId ? `store=${storeId}&` : "";
    router.push(`/storeinfo?${store}q=${encodeURIComponent(local.trim())}`);
  }

  return (
    <header className="sh-header">
      <div className="sh-wrap sh-header__row">
        <Link href="/" className="sh-logo">
          UAS Shop
        </Link>

        <form className="sh-search" onSubmit={submit} role="search">
          <input
            value={value}
            onChange={(e) => (onQueryChange ? onQueryChange(e.target.value) : setLocal(e.target.value))}
            placeholder={placeholder}
            aria-label="Search"
          />
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>

        <Link href="/checkout" className="sh-cart" aria-label="Go to checkout">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.7 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6" />
          </svg>
          {count > 0 && <span className="sh-cart__badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
