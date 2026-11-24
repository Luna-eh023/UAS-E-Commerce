"use client";

import { useEffect, useState } from "react";
import { validatePayment, isCvcValid } from "./payment";
import { calcTotal, formatRupiah, getItemImage, type OrderItem } from "../lib/orders";
import "./PaymentPage.css";

export type PayMethod = "card" | "ewallet" | "qr" | "other";

export interface SavedCard {
  id: string;
  brand: "Mastercard" | "Visa" | "Amex";
  last4: string;
  expiry: string; // MM/YY
}

export interface PayRequest {
  method: PayMethod;
  amount: number;
  provider?: string;
  savedCardId?: string;
  card?: { number: string; name: string; expiry: string; cvc: string; save: boolean };
}

interface Props {
  storeName: string;
  items: OrderItem[];
  savedCards?: SavedCard[];
  /** Plug your payment provider call in here. Resolve with { id } or throw to decline. */
  gateway: (req: PayRequest) => Promise<{ id: string }>;
  /** Runs after a successful payment, e.g. save the order to Firestore. */
  onSuccess?: (info: { transactionId: string; method: PayMethod }) => void | Promise<void>;
}

const TABS: { id: PayMethod; label: string }[] = [
  { id: "card", label: "Credit card" },
  { id: "ewallet", label: "E-wallet" },
  { id: "qr", label: "QR" },
  { id: "other", label: "Other" },
];

const WALLETS = ["GoPay", "OVO", "DANA", "ShopeePay"];
const OTHERS = ["Bank transfer", "Convenience store", "Pay on delivery"];

const formatCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function detectBrand(digits: string): "Mastercard" | "Visa" | "Amex" | null {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return null;
}

function BrandMark({ brand }: { brand: string }) {
  if (brand === "Mastercard")
    return (
      <span className="pp-mc" aria-label="Mastercard">
        <i />
        <i />
      </span>
    );
  if (brand === "Visa")
    return (
      <span className="pp-visa" aria-label="Visa">
        VISA
      </span>
    );
  return (
    <span className="pp-amex" aria-label="American Express">
      AMEX
    </span>
  );
}

export default function PaymentPage({
  storeName,
  items,
  savedCards = [],
  gateway,
  onSuccess,
}: Props) {
  const amount = calcTotal(items);

  const [tab, setTab] = useState<PayMethod>("card");
  const [selectedCard, setSelectedCard] = useState<string>("new");
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [showCvc, setShowCvc] = useState(false);
  const [save, setSave] = useState(false);
  const [wallet, setWallet] = useState("");
  const [other, setOther] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [invoice, setInvoice] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  // Generated after mount so server and browser HTML match
  useEffect(() => {
    setInvoice(`INV-${Date.now().toString().slice(-8)}`);
  }, []);

  const brand = detectBrand(number.replace(/\s/g, ""));
  const usingSaved = tab === "card" && selectedCard !== "new";
  const savedChosen = savedCards.find((c) => c.id === selectedCard);
  const firstImage = items[0] ? getItemImage(items[0]) : null;
  const locked = loading || paid;

  function fail(text: string) {
    setMessage({ ok: false, text });
  }

  async function handlePay() {
    setMessage(null);
    const req: PayRequest = { method: tab, amount };

    if (tab === "card") {
      if (usingSaved) {
        if (!isCvcValid(cvc)) return fail("Invalid CVC");
        req.savedCardId = selectedCard;
        req.card = { number: "", name: "", expiry: "", cvc, save: false };
      } else {
        const err =
          validatePayment({ cardNumber: number, expiry, cvc, amount }) ??
          (name.trim() ? null : "Enter the name on the card");
        if (err) return fail(err);
        req.card = { number, name: name.trim(), expiry, cvc, save };
      }
    } else if (tab === "ewallet") {
      if (!wallet) return fail("Choose an e-wallet");
      req.provider = wallet;
    } else if (tab === "other") {
      if (!other) return fail("Choose a payment option");
      req.provider = other;
    }

    setLoading(true);
    let transactionId = "";
    try {
      const res = await gateway(req);
      transactionId = res.id;
    } catch {
      setLoading(false);
      return fail("Payment declined. Please try again.");
    }

    setPaid(true);
    setMessage({ ok: true, text: `Payment successful: ${transactionId}` });
    try {
      await onSuccess?.({ transactionId, method: tab });
    } catch {
      setMessage({
        ok: false,
        text: `Payment went through (${transactionId}) but saving the order failed. Please contact support.`,
      });
    }
    setLoading(false);
  }

  return (
    <div className="pp-page">
      <div className="pp-shell">
    <div className="pp">
      <section className="pp-main">
        <h1 className="pp-title">Select Payment method</h1>

        <div className="pp-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`pp-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setMessage(null);
              }}
              disabled={locked}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`pp-body ${tab === "card" ? "pp-body--card" : ""}`}>
          {tab === "card" && (
            <div className="pp-cards">
              {savedCards.map((c, i) => (
                <button
                  key={c.id}
                  className={`pp-cc pp-cc--${i % 2 === 0 ? "purple" : "pink"}`}
                  onClick={() => setSelectedCard(c.id)}
                  disabled={locked}
                  aria-pressed={selectedCard === c.id}
                >
                  <span className="pp-cc__top">
                    <span>{c.brand}</span>
                    <BrandMark brand={c.brand} />
                  </span>
                  <span className="pp-cc__bottom">
                    <span>•••• •••• •••• {c.last4}</span>
                    <span>{c.expiry}</span>
                  </span>
                  {selectedCard === c.id && <span className="pp-check">✓</span>}
                </button>
              ))}
              <button
                className="pp-cc pp-cc--new"
                onClick={() => setSelectedCard("new")}
                disabled={locked}
                aria-pressed={selectedCard === "new"}
              >
                <span className="pp-new">
                  Add new <b>+</b>
                </span>
                {selectedCard === "new" && <span className="pp-check">✓</span>}
              </button>
            </div>
          )}

          <div className="pp-panel">
            {tab === "card" && (
              <>
                <h2 className="pp-sub">Pay using credit cards</h2>
                <div className="pp-brands">
                  <BrandMark brand="Mastercard" />
                  <BrandMark brand="Visa" />
                  <BrandMark brand="Amex" />
                </div>

                {usingSaved ? (
                  <p className="pp-note">
                    Paying with {savedChosen?.brand} •••• {savedChosen?.last4}. Enter the CVC to
                    confirm.
                  </p>
                ) : (
                  <>
                    <div className="pp-field">
                      <label htmlFor="pp-number">Card number</label>
                      <div className="pp-input">
                        <input
                          id="pp-number"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="2324 5566 6677 7898"
                          value={number}
                          onChange={(e) => setNumber(formatCard(e.target.value))}
                          disabled={locked}
                        />
                        {brand && <BrandMark brand={brand} />}
                      </div>
                    </div>
                    <div className="pp-field">
                      <label htmlFor="pp-name">Name</label>
                      <div className="pp-input">
                        <input
                          id="pp-name"
                          autoComplete="cc-name"
                          placeholder="Name on card"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={locked}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pp-row">
                  {!usingSaved && (
                    <div className="pp-field">
                      <label htmlFor="pp-expiry">Expiration date</label>
                      <div className="pp-input">
                        <input
                          id="pp-expiry"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          disabled={locked}
                        />
                      </div>
                    </div>
                  )}
                  <div className="pp-field">
                    <label htmlFor="pp-cvc">CVC</label>
                    <div className="pp-input">
                      <input
                        id="pp-cvc"
                        type={showCvc ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        maxLength={4}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                        disabled={locked}
                      />
                      <button
                        type="button"
                        className="pp-eye"
                        onClick={() => setShowCvc((s) => !s)}
                        aria-label={showCvc ? "Hide CVC" : "Show CVC"}
                      >
                        {showCvc ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "ewallet" && (
              <>
                <h2 className="pp-sub">Pay with an e-wallet</h2>
                <div className="pp-options">
                  {WALLETS.map((w) => (
                    <button
                      key={w}
                      className={`pp-option ${wallet === w ? "is-selected" : ""}`}
                      onClick={() => setWallet(w)}
                      disabled={locked}
                      aria-pressed={wallet === w}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "qr" && (
              <>
                <h2 className="pp-sub">Pay with QR</h2>
                <div className="pp-qr">The QR code appears here after you press Pay.</div>
              </>
            )}

            {tab === "other" && (
              <>
                <h2 className="pp-sub">Other payment options</h2>
                <div className="pp-options">
                  {OTHERS.map((o) => (
                    <button
                      key={o}
                      className={`pp-option ${other === o ? "is-selected" : ""}`}
                      onClick={() => setOther(o)}
                      disabled={locked}
                      aria-pressed={other === o}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="pp-footer">
              {tab === "card" && !usingSaved ? (
                <label className="pp-check-label">
                  <input
                    type="checkbox"
                    checked={save}
                    onChange={(e) => setSave(e.target.checked)}
                    disabled={locked}
                  />
                  Save card
                </label>
              ) : (
                <span />
              )}
              <button className="pp-pay" onClick={handlePay} disabled={locked}>
                {loading ? "Processing..." : paid ? "Paid" : "Pay"}
              </button>
            </div>

            {message && (
              <p
                className={`pp-msg ${message.ok ? "pp-msg--ok" : "pp-msg--err"}`}
                role={message.ok ? "status" : "alert"}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      </section>

      <aside className="pp-summary">
        <h2 className="pp-title">Order Summary</h2>
        <div className="pp-summary__card">
          <div className="pp-thumb">
            {firstImage && !imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firstImage} alt={items[0].name} onError={() => setImgFailed(true)} />
            ) : (
              <span>{items[0]?.name.charAt(0)}</span>
            )}
          </div>
          <p className="pp-product">
            {items.length === 1 ? items[0].name : `${items.length} products`}
          </p>
          <p className="pp-price">{formatRupiah(amount)}</p>

          <dl className="pp-rows">
            <div>
              <dt>Store</dt>
              <dd>{storeName}</dd>
            </div>
            <div>
              <dt>Invoice</dt>
              <dd>{invoice}</dd>
            </div>
          </dl>

          <ul className="pp-items">
            {items.map((it, i) => (
              <li key={i}>
                <span>
                  {it.name} ({it.variant}) × {it.qty}
                </span>
                <span>{formatRupiah(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="pp-rows pp-rows--totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatRupiah(amount)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd className="pp-total">{formatRupiah(amount)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
      </div>
    </div>
  );
}
