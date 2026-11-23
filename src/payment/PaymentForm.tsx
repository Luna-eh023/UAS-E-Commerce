"use client";

import { useState } from "react";
import { processPayment, type Gateway, type PaymentResult } from "./payment";
import "./PaymentForm.css";

interface Props {
  amount: number;
  /** Plug your Firebase call in here. Resolve with { id } or throw to decline. */
  gateway: Gateway;
  onResult?: (result: PaymentResult) => void;
}

function detectBrand(digits: string): string {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

const formatCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function PaymentForm({ amount, gateway, onResult }: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const digits = cardNumber.replace(/\s/g, "");
  const brand = detectBrand(digits);
  const succeeded = result?.success === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await processPayment({ cardNumber, expiry, cvc, amount }, gateway);
    setResult(res);
    setLoading(false);
    onResult?.(res);
  }

  return (
    <form className="pay" onSubmit={handleSubmit} noValidate>
      <div className="pay-card" aria-hidden="true">
        <span className="pay-card__brand">{brand}</span>
        <span className="pay-card__number">{cardNumber || "•••• •••• •••• ••••"}</span>
        <span className="pay-card__expiry">{expiry || "MM/YY"}</span>
      </div>

      <div className="pay-field">
        <label htmlFor="card">Card number</label>
        <input
          id="card"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCard(e.target.value))}
          disabled={succeeded}
        />
      </div>

      <div className="pay-row">
        <div className="pay-field">
          <label htmlFor="expiry">Expiry (MM/YY)</label>
          <input
            id="expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            disabled={succeeded}
          />
        </div>
        <div className="pay-field">
          <label htmlFor="cvc">CVC</label>
          <input
            id="cvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
            disabled={succeeded}
          />
        </div>
      </div>

      <button className="pay-button" type="submit" disabled={loading || succeeded}>
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>

      {result?.success && (
        <p className="pay-msg pay-msg--ok" role="status">
          Payment successful: {result.transactionId}
        </p>
      )}
      {result && !result.success && (
        <p className="pay-msg pay-msg--err" role="alert">
          {result.error}
        </p>
      )}
    </form>
  );
}
