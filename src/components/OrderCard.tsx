"use client";

import Image from "next/image";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import {
  Order,
  STATUS_COLOR,
  STATUS_FLOW,
  STATUS_LABEL,
  REFUND_WINDOW_DAYS,
  canRefund,
  formatRupiah,
  formatTanggal,
  getItemImage,
  getRefundDeadline,
} from "@/lib/orders";

type OrderCardProps = {
  order: Order;
  onAdvance: (order: Order) => void;
  onReview: (order: Order) => void;
  onBuyAgain: (order: Order) => void;
  onRefund: (order: Order) => void;
};

export default function OrderCard({
  order,
  onAdvance,
  onReview,
  onBuyAgain,
  onRefund,
}: OrderCardProps) {
  const stepIndex = STATUS_FLOW.indexOf(order.status);
  const isArrived = order.status === "sampai";
  const refundable = canRefund(order);
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
  const nextStatus = STATUS_FLOW[stepIndex + 1];

  return (
    <div className="card mb-3 border-0 shadow-sm overflow-hidden">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold">{order.storeName}</span>
          <span className="text-muted small">
            • Dipesan {formatTanggal(order.createdAt)}
          </span>
        </div>
        {order.refunded ? (
          <Badge bg="dark">Dana Dikembalikan</Badge>
        ) : (
          <Badge bg={STATUS_COLOR[order.status]}>
            {STATUS_LABEL[order.status]}
          </Badge>
        )}
      </div>

      <div className="row g-0">
        <div className="col-lg-8 p-4">
          <div className="d-flex mb-4">
            {STATUS_FLOW.map((step, i) => {
              const done = i <= stepIndex;
              return (
                <div key={step} className="flex-fill text-center small">
                  <div
                    className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center text-white ${done ? "bg-success" : "bg-secondary-subtle"
                      }`}
                    style={{ width: 28, height: 28 }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={done ? "fw-semibold" : "text-muted"}>
                    {STATUS_LABEL[step]}
                  </span>
                </div>
              );
            })}
          </div>

          {isArrived && order.arrivedAt && (
            <div className="alert alert-success py-2 small">
              Sampai tujuan pada <b>{formatTanggal(order.arrivedAt)}</b>
              {!order.refunded && (
                <div className="mt-1">
                  {refundable
                    ? `Dana bisa dikembalikan sampai ${formatTanggal(
                      getRefundDeadline(order.arrivedAt).toISOString()
                    )} (maks ${REFUND_WINDOW_DAYS} hari setelah sampai).`
                    : `Batas pengembalian dana (${REFUND_WINDOW_DAYS} hari setelah sampai) sudah lewat.`}
                </div>
              )}
            </div>
          )}

          <ul className="list-unstyled mb-0">
            {order.items.map((item, i) => {
              const image = getItemImage(item);
              return (
                <li
                  key={`${item.name}-${i}`}
                  className="d-flex align-items-center gap-3 py-2"
                >
                  <div className="item-thumb">
                    {image ? (
                      <Image
                        src={image}
                        alt={item.name}
                        width={72}
                        height={72}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      item.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{item.name}</div>
                    {item.variant && (
                      <div className="text-muted small">{item.variant}</div>
                    )}
                  </div>
                  <div className="text-end">
                    <div>{formatRupiah(item.price)}</div>
                    <div className="text-muted small">x{item.qty}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>


        <div className="col-lg-4 p-4 order-side d-flex flex-column">
          <div className="text-muted small">
            Total Belanja ({totalQty} barang)
          </div>
          <div className="fw-bold fs-3 mb-3" style={{ color: "#03ac0e" }}>
            {formatRupiah(order.total)}
          </div>

          {order.review && (
            <div className="bg-white border rounded p-2 small mb-3">
              <div className="text-warning">
                {"★".repeat(order.review.rating)}
                {"☆".repeat(5 - order.review.rating)}
              </div>
              {order.review.comment && <div>{order.review.comment}</div>}
            </div>
          )}

          <div className="d-grid gap-2 mt-auto">
            {isArrived ? (
              <>
                <Button variant="primary" onClick={() => onBuyAgain(order)}>
                  Beli Lagi
                </Button>
                {!order.review && (
                  <Button
                    variant="outline-primary"
                    onClick={() => onReview(order)}
                  >
                    Tulis Ulasan
                  </Button>
                )}
                {refundable && (
                  <Button
                    variant="outline-danger"
                    onClick={() => onRefund(order)}
                  >
                    Kembalikan Dana
                  </Button>
                )}
              </>
            ) : (
              nextStatus && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onAdvance(order)}
                >
                  Simulasi: lanjut ke &quot;{STATUS_LABEL[nextStatus]}&quot;
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
