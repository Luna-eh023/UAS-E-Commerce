"use client";

import PaymentPage from "../payment/PaymentPage";
import { createOrder, type OrderItem } from "../lib/orders";

const items: OrderItem[] = [
  { name: "Mouse Wireless Slim", variant: "Abu-abu", price: 85000, qty: 1 },
];

export default function Home() {
  return (
    <PaymentPage
      storeName="TechZone Official"
      items={items}
      gateway={async () => {
        // Later: call your payment provider here.
        await new Promise((r) => setTimeout(r, 800)); // fake delay for now
        return { id: "txn_" + Math.random().toString(36).slice(2, 10) };
      }}
      onSuccess={async ({ transactionId }) => {
        await createOrder({
          storeName: "TechZone Official",
          items,
          transactionId,
        });
      }}
    />
  );
}