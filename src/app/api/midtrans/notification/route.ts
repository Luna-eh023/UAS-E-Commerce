
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

// Midtrans notification webhook
// Docs: https://docs.midtrans.com/reference/handling-notifications

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean {
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computed = crypto.createHash("sha512").update(payload).digest("hex");
  return computed === receivedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;

    // Verifikasi signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      serverKey,
      signature_key
    );

    if (!isValid) {
      console.warn("[midtrans/notification] Signature tidak valid:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Cari order berdasarkan midtransOrderId
    const snapshot = await adminDb
      .collection("orders")
      .where("midtransOrderId", "==", order_id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn("[midtrans/notification] Order tidak ditemukan:", order_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderDoc = snapshot.docs[0];

    // Tentukan paymentStatus berdasarkan transaction_status & fraud_status
    let paymentStatus: string;

    if (
      transaction_status === "capture" &&
      fraud_status === "accept"
    ) {
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

    if (paymentStatus === "paid") {
      updateData.paidAt = new Date().toISOString();
    }

    await orderDoc.ref.update(updateData);

    console.log(
      `[midtrans/notification] Order ${order_id} → ${paymentStatus}`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[midtrans/notification]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
