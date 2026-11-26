
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/components/CartContext";
import { formatRupiah } from "@/lib/orders";
import { validateVoucher } from "@/lib/vouchers";
import { useAuth } from "@/components/AuthProvider";

// Deklarasi global window.snap (dari Midtrans Snap.js)
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const SNAP_JS_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  const [recipientName, setRecipientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("Reguler");
  const [paymentMethod, setPaymentMethod] = useState("Midtrans");

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const snapLoaded = useRef(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = shippingMethod === "Express" ? 20000 : 10000;
  const total = subtotal - discount + shippingFee;

  // Isi nama & telepon otomatis dari akun
  useEffect(() => {
    if (user?.displayName && !recipientName) {
      setRecipientName(user.displayName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleApplyVoucher() {
    setVoucherMessage("");
    setVoucherSuccess(false);
    const result = validateVoucher(voucherCode, subtotal);
    if (!result.valid) {
      setAppliedVoucher("");
      setDiscount(0);
      setVoucherMessage(result.message);
      return;
    }
    setAppliedVoucher(voucherCode.trim().toUpperCase());
    setDiscount(result.discount);
    setVoucherMessage(result.message);
    setVoucherSuccess(true);
  }

  function handleRemoveVoucher() {
    setVoucherCode("");
    setAppliedVoucher("");
    setDiscount(0);
    setVoucherMessage("");
    setVoucherSuccess(false);
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Keranjang belanja kamu kosong.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product: {
              id: i.product.id,
              name: i.product.name,
              price: i.product.price,
            },
            quantity: i.quantity,
          })),
          recipientName,
          phoneNumber,
          shippingAddress,
          shippingMethod,
          paymentMethod,
          voucherCode: appliedVoucher || undefined,
          userId: user?.uid,
          userEmail: user?.email,
        }),
      });

      // Baca response body dengan aman (mungkin bukan JSON jika server crash)
      const text = await res.text();
      let data: { error?: string; orderId?: string; snapToken?: string; isCod?: boolean };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server error (${res.status}). Periksa log terminal dev server.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      const { orderId, snapToken, isCod } = data as {
        orderId: string;
        snapToken?: string;
        isCod: boolean;
      };

      // --- COD: langsung ke halaman pesanan ---
      if (isCod) {
        clearCart();
        router.push(`/orders?success=${orderId}`);
        return;
      }

      // --- Bayar via Midtrans Snap ---
      if (!snapToken) {
        throw new Error("Snap token tidak diterima dari server.");
      }

      if (!window.snap) {
        throw new Error(
          "Snap.js belum siap. Muat ulang halaman dan coba lagi."
        );
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          try {
            const syncResponse = await fetch("/api/orders/sync-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });

            if (!syncResponse.ok) {
              const syncData = await syncResponse.json();
              throw new Error(
                syncData.error || "Status pembayaran belum tersinkron."
              );
            }
          } catch (syncError) {
            console.error("Gagal menyinkronkan pembayaran:", syncError);
          }

          clearCart();
          router.push(`/orders?success=${orderId}`);
        },
        onPending: () => {
          clearCart();
          router.push(`/orders?pending=${orderId}`);
        },
        onError: () => {
          setError(
            "Pembayaran gagal. Silakan coba lagi atau pilih metode lain."
          );
          setLoading(false);
        },
        onClose: () => {
          // User menutup popup tanpa bayar → tetap di checkout
          setLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="container py-5">
        <div className="text-center py-5">
          <h2>Keranjang kamu kosong</h2>
          <p className="text-muted">
            Tambahkan produk terlebih dahulu sebelum checkout.
          </p>
          <Link href="/" className="btn btn-primary mt-3">
            Belanja Sekarang
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Muat Midtrans Snap.js */}
      <Script
        src={SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => {
          snapLoaded.current = true;
        }}
      />

      <main className="container py-4 py-md-5">
        <div className="mb-4">
          <Link href="/cart" className="text-decoration-none">
            &larr; Kembali ke Keranjang
          </Link>
        </div>

        <h1 className="h3 fw-bold mb-4">Checkout</h1>

        <form onSubmit={handleCheckout}>
          <div className="row g-4">
            {/* ===== Kolom Kiri ===== */}
            <div className="col-lg-8">
              {/* Informasi Penerima */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Informasi Penerima</h5>

                  <div className="mb-3">
                    <label className="form-label">Nama Penerima</label>
                    <input
                      type="text"
                      className="form-control"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Masukkan nama penerima"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nomor Telepon</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label">Alamat Lengkap</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah, kecamatan, kota, kode pos"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pengiriman */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Pengiriman</h5>
                  <div className="mb-0">
                    <label className="form-label">Pilih Pengiriman</label>
                    <select
                      className="form-select"
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    >
                      <option value="Reguler">Reguler - Rp10.000</option>
                      <option value="Express">Express - Rp20.000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Metode Pembayaran</h5>
                  <div className="mb-0">
                    <label className="form-label">Pilih Pembayaran</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Midtrans">
                        Bayar Online (Transfer, QRIS, E-Wallet, dll.)
                      </option>
                      <option value="COD">COD (Bayar di Tempat)</option>
                    </select>
                  </div>

                  {paymentMethod === "Midtrans" && (
                    <div className="alert alert-info py-2 small mt-3 mb-0">
                      Setelah klik <strong>&ldquo;Bayar Sekarang&rdquo;</strong>,
                      popup pembayaran Midtrans akan muncul. Pilih metode
                      (Transfer Bank, QRIS, GoPay, OVO, dll.) di sana.
                    </div>
                  )}

                  {paymentMethod === "COD" && (
                    <small className="text-muted d-block mt-3">
                      Bayar langsung ke kurir saat paket tiba.
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Kolom Kanan ===== */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Ringkasan Pesanan</h5>

                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="d-flex justify-content-between gap-3 mb-3"
                    >
                      <div>
                        <div className="fw-medium">{item.product.name}</div>
                        <small className="text-muted">
                          {item.quantity} x {formatRupiah(item.product.price)}
                        </small>
                      </div>
                      <div className="text-end fw-medium">
                        {formatRupiah(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}

                  <hr />

                  {/* Voucher */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Voucher Diskon</h6>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Masukkan kode voucher"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value);
                          if (appliedVoucher) handleRemoveVoucher();
                        }}
                        disabled={!!appliedVoucher}
                      />
                      {appliedVoucher ? (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={handleRemoveVoucher}
                        >
                          Hapus
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handleApplyVoucher}
                          disabled={!voucherCode.trim()}
                        >
                          Gunakan
                        </button>
                      )}
                    </div>
                    {voucherMessage && (
                      <div
                        className={`small mt-2 ${
                          voucherSuccess ? "text-success" : "text-danger"
                        }`}
                      >
                        {voucherMessage}
                      </div>
                    )}
                    {appliedVoucher && (
                      <div className="small text-success mt-2">
                        Voucher <strong>{appliedVoucher}</strong> diterapkan.
                      </div>
                    )}
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Ongkir</span>
                    <span>{formatRupiah(shippingFee)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Diskon</span>
                    <span>-{formatRupiah(discount)}</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                    <span>Total</span>
                    <span>{formatRupiah(total)}</span>
                  </div>

                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-bold"
                    disabled={loading}
                  >
                    {loading
                      ? "Memproses..."
                      : paymentMethod === "COD"
                      ? "Buat Pesanan (COD)"
                      : "Bayar Sekarang"}
                  </button>

                  <p className="text-muted small text-center mt-3 mb-0">
                    Dengan membuat pesanan, kamu menyetujui proses checkout
                    pada Digeboy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
