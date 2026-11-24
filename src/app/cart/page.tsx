"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <main className="container py-4">
      <div className="mb-4">
        <Link href="/" className="text-decoration-none text-success">
          ← Kembali Belanja
        </Link>

        <h2 className="fw-bold mt-3">Keranjang Belanja</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5 bg-body-tertiary rounded-4">
          <div className="display-4 mb-3">🛒</div>

          <h4>Keranjang masih kosong</h4>

          <p className="text-muted">
            Yuk, temukan produk favoritmu.
          </p>

          <Link href="/" className="btn btn-success">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  Produk ({items.length})
                </h5>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={clearCart}
                >
                  Kosongkan Keranjang
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="card border-0 shadow-sm"
                  >
                    <div className="card-body">
                      <div className="row align-items-center g-3">
                        <div className="col-4 col-md-3">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={300}
                            height={300}
                            className="img-fluid rounded"
                            style={{
                              objectFit: "contain",
                              height: "140px",
                              width: "100%",
                            }}
                          />
                        </div>

                        <div className="col-8 col-md-9">
                          <div className="d-flex justify-content-between gap-2">
                            <div>
                              <h6 className="fw-bold">
                                {item.product.name}
                              </h6>

                              <span className="badge text-bg-light">
                                {item.product.category}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                removeFromCart(item.product.id)
                              }
                            >
                              Hapus
                            </button>
                          </div>

                          <p className="text-success fw-bold mt-2 mb-3">
                            {formatRupiah(item.product.price)}
                          </p>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                decreaseQuantity(item.product.id)
                              }
                            >
                              -
                            </button>

                            <span className="fw-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                increaseQuantity(item.product.id)
                              }
                            >
                              +
                            </button>
                          </div>

                          <p className="small text-muted mt-2 mb-0">
                            Subtotal produk:{" "}
                            {formatRupiah(
                              item.product.price * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm sticky-top cart-summary">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">
                    Ringkasan Belanja
                  </h5>

                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                    <span>Total</span>
                    <span className="text-success">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success w-100"
                    disabled
                  >
                    Checkout (Tahap Berikutnya)
                  </button>

                  <p className="text-muted small mt-3 mb-0">
                    Fitur checkout akan dikembangkan pada tahap
                    berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}