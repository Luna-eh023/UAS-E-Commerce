"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { Product } from "@/lib/products";
import {
  listenWishlist, listenCartCount, addToWishlist, removeFromWishlist, moveToCart,
} from "@/lib/wishlist";

type Ctx = {
  items: Product[];
  ids: Set<string>;
  cartCount: number;
  toggle: (p: Product) => Promise<void>;
  remove: (id: string) => Promise<void>;
  moveToCart: (p: Product) => Promise<void>;
};

const WishlistContext = createContext<Ctx>({
  items: [], ids: new Set(), cartCount: 0,
  toggle: async () => {}, remove: async () => {}, moveToCart: async () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) { setItems([]); setCartCount(0); return; }
    const u1 = listenWishlist(user.uid, setItems);
    const u2 = listenCartCount(user.uid, setCartCount);
    return () => { u1(); u2(); };
  }, [user]);

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const needLogin = () => { router.push("/login"); };

  const value: Ctx = {
    items, ids, cartCount,
    toggle: async (p) => {
      if (!user) return needLogin();
      if (ids.has(p.id)) await removeFromWishlist(user.uid, p.id);
      else await addToWishlist(user.uid, p);
    },
    remove: async (id) => { if (user) await removeFromWishlist(user.uid, id); },
    moveToCart: async (p) => { if (!user) return needLogin(); await moveToCart(user.uid, p); },
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
