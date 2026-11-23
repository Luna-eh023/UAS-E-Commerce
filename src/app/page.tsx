"use client";

import PaymentForm from "../payment/PaymentForm";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <PaymentForm
        amount={25}
        gateway={async () => {
          // Later: call your Firebase / payment provider here.
          await new Promise((r) => setTimeout(r, 800)); // fake delay for now
          return { id: "txn_" + Math.random().toString(36).slice(2, 10) };
        }}
        onResult={(r) => console.log(r)}
      />
    </main>
  );
}