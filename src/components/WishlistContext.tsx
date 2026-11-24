
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/components/AuthProvider";
import {
  subscribeToWishlist,
  addToWishlist as addWishlistService,
  removeFromWishlist as removeWishlistService,
} from "@/lib/wishlist";

type WishlistContextType = {
  productIds: number[];
  loading: boolean;
  error: string;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
};

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();

  const [productIds, setProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProductIds([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    const unsubscribe = subscribeToWishlist(
      user.uid,
      (ids) => {
        setProductIds(ids);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Wishlist listener error:", err);
        setError("Gagal memuat wishlist.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  function isWishlisted(productId: number) {
    return productIds.includes(productId);
  }

  async function toggleWishlist(productId: number) {
    if (!user) {
      throw new Error("Silakan login terlebih dahulu.");
    }

    if (isWishlisted(productId)) {
      await removeWishlistService(user.uid, productId);
    } else {
      await addWishlistService(user.uid, productId);
    }
  }

  async function removeFromWishlist(productId: number) {
    if (!user) {
      throw new Error("Silakan login terlebih dahulu.");
    }

    await removeWishlistService(user.uid, productId);
  }

  return (
    <WishlistContext.Provider
      value={{
        productIds,
        loading,
        error,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist harus digunakan di dalam WishlistProvider"
    );
  }

  return context;
}
