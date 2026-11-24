"use client";

import { useEffect, useState } from "react";
import DigeboyHeader from "../../components/DigeboyHeader";
import PaymentPage, { type SavedCard } from "../../payment/PaymentPage";
import { createOrder, type OrderItem } from "../../lib/orders";

type Cart = { storeName: string; items: OrderItem[] };

// Shown when you open /checkout directly, without picking a product first
const FALLBACK: Cart = {
  storeName: "Gadget Mart",
  items: [{ name: "Mouse Wireless Slim", variant: "Abu-abu", price: 85000, qty: 1 }],
};

// Demo only. Real saved cards should come from your payment provider (last 4 digits only).
const savedCards: SavedCard[] = [
  { id: "c1", brand: "Mastercard", last4: "1289", expiry: "09/30" },
  { id: "c2", brand: "Mastercard", last4: "2468", expiry: "12/29" },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("checkout");
      setCart(raw ? (JSON.parse(raw) as Cart) : FALLBACK);
    } catch {
      setCart(FALLBACK);
    }
  }, []);

  return (
    <>
      <DigeboyHeader />
      {cart && (
        <PaymentPage
          storeName={cart.storeName}
          items={cart.items}
          savedCards={savedCards}
          gateway={async (req) => {
            // Fake payment for now. Replace with your real provider call later.
            console.log("pay request:", { ...req, card: req.card ? "[hidden]" : undefined });
            await new Promise((r) => setTimeout(r, 800));
            return { id: "txn_" + Math.random().toString(36).slice(2, 10) };
          }}
          onSuccess={async ({ transactionId }) => {
            await createOrder({
              storeName: cart.storeName,
              items: cart.items,
              transactionId,
            });
          }}
        />
      )}
    </>
  );
}
