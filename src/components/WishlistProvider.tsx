"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartContext";
import type { Product } from "@/lib/catalog";
import { listenWishlist, addToWishlist, removeFromWishlist } from "@/lib/wishlist";

type Ctx = {
  items: Product[];
  ids: Set<string>;
  toggle: (p: Product) => Promise<void>;
  remove: (id: string) => Promise<void>;
  moveToCart: (p: Product) => Promise<void>;
};

const WishlistContext = createContext<Ctx>({
  items: [], ids: new Set(),
  toggle: async () => {}, remove: async () => {}, moveToCart: async () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    return listenWishlist(user.uid, setItems);
  }, [user]);

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const value: Ctx = {
    items, ids,
    toggle: async (p) => {
      if (!user) { router.push("/login"); return; }
      if (ids.has(p.id)) await removeFromWishlist(user.uid, p.id);
      else await addToWishlist(user.uid, p);
    },
    remove: async (id) => { if (user) await removeFromWishlist(user.uid, id); },
    // Masukkan ke keranjang milik dashboard (CartContext), lalu hapus dari wishlist
    moveToCart: async (p) => {
      if (!user) { router.push("/login"); return; }
      addToCart({
        id: p.id, name: p.name, category: p.category, price: p.price,
        image: "/images/placeholder.svg", description: `${p.category} • ${p.location}`,
      });
      await removeFromWishlist(user.uid, p.id);
    },
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
