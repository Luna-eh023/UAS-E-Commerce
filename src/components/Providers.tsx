"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/CartContext";
import AuthProvider from "@/components/AuthProvider";
import WishlistProvider from "@/components/WishlistProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
