
// Endpoint untuk sinkronisasi status pembayaran secara manual.
// Berguna saat testing lokal (tanpa ngrok) ketika webhook Midtrans
// tidak bisa memanggil localhost.

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

type MidtransStatusResponse = {
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
};

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId diperlukan." },
        { status: 400 }
      );
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: "Order tidak ditemukan." },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data()!;
    const midtransOrderId: string = orderData.midtransOrderId;

    if (!midtransOrderId) {
      return NextResponse.json(
        { error: "Order ini tidak memiliki transaksi Midtrans." },
        { status: 400 }
      );
    }

    // Ambil status dari Midtrans menggunakan CoreApi
    const { createCoreApi } = await import("@/lib/midtrans");
    const coreApi = createCoreApi();

    const status: MidtransStatusResponse =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (coreApi as any).transaction.status(midtransOrderId);

    const { transaction_status, fraud_status } = status;

    let paymentStatus: string;

    if (transaction_status === "capture" && fraud_status === "accept") {
      paymentStatus = "paid";
    } else if (transaction_status === "settlement") {
      paymentStatus = "paid";
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "failure"
    ) {
      paymentStatus = "failed";
    } else if (transaction_status === "expire") {
      paymentStatus = "expired";
    } else {
      paymentStatus = "pending";
    }

    const updateData: Record<string, unknown> = { paymentStatus };

    if (paymentStatus === "paid" && !orderData.paidAt) {
      updateData.paidAt = new Date().toISOString();
    }

    await orderRef.update(updateData);

    return NextResponse.json({ paymentStatus });
  } catch (err) {
    console.error("[/api/orders/sync-payment]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Gagal sinkronisasi pembayaran.",
      },
      { status: 500 }
    );
  }
}
