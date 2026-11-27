
import { NextRequest, NextResponse } from "next/server";
import { createSnap } from "@/lib/midtrans";
import { getAdminDb } from "@/lib/firebase-admin";
import { validateVoucher } from "@/lib/vouchers";
import type { PaymentStatus } from "@/lib/orders";

type CartItemPayload = {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
};

type CheckoutPayload = {
  items: CartItemPayload[];
  recipientName: string;
  phoneNumber: string;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  voucherCode?: string;
  userId?: string;
  userEmail?: string;
};

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const body: CheckoutPayload = await req.json();

    const {
      items,
      recipientName,
      phoneNumber,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      voucherCode,
      userId,
      userEmail,
    } = body;

    // --- Validasi dasar ---
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang belanja kosong." },
        { status: 400 }
      );
    }

    if (!recipientName?.trim() || !phoneNumber?.trim() || !shippingAddress?.trim()) {
      return NextResponse.json(
        { error: "Informasi penerima harus lengkap." },
        { status: 400 }
      );
    }

    // --- Hitung subtotal di server (jangan percaya client) ---
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // --- Hitung ongkir ---
    const shippingFee = shippingMethod === "Express" ? 20000 : 10000;

    // --- Validasi dan hitung diskon voucher ---
    let discount = 0;
    let appliedVoucher = "";
    if (voucherCode) {
      const result = validateVoucher(voucherCode, subtotal);
      if (result.valid) {
        discount = result.discount;
        appliedVoucher = voucherCode.trim().toUpperCase();
      }
    }

    if (discount > subtotal) {
      return NextResponse.json(
        { error: "Diskon melebihi subtotal." },
        { status: 400 }
      );
    }

    const total = subtotal - discount + shippingFee;

    // --- Buat ID order unik ---
    const midtransOrderId = `DIGEBOY-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

    // --- Tentukan paymentStatus awal ---
    const isCod = paymentMethod === "COD";
    const paymentStatus: PaymentStatus = isCod ? "cod" : "pending";

    // --- Simpan order ke Firestore ---
    const orderData = {
      storeName: "Digeboy Official",
      storeLogo: null,
      items: items.map((item) => ({
        name: item.product.name,
        variant: "-",
        price: item.product.price,
        qty: item.quantity,
      })),
      total,
      status: "gudang",
      createdAt: new Date().toISOString(),
      arrivedAt: null,
      review: null,
      refunded: false,
      refundedAt: null,
      recipientName: recipientName.trim(),
      phoneNumber: phoneNumber.trim(),
      shippingAddress: shippingAddress.trim(),
      shippingMethod,
      shippingFee,
      discount,
      voucherCode: appliedVoucher || null,
      paymentMethod,
      paymentStatus,
      midtransOrderId,
      snapToken: null,
      snapRedirectUrl: null,
      paidAt: null,
      userId: userId || null,
      userEmail: userEmail || null,
    };

    const docRef = await adminDb.collection("orders").add(orderData);
    const orderId = docRef.id;

    // --- Jika COD, langsung kembalikan orderId tanpa Snap ---
    if (isCod) {
      return NextResponse.json({ orderId, isCod: true });
    }

    // --- Buat transaksi Midtrans Snap ---
    const snapParam = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: total,
      },
      customer_details: {
        first_name: recipientName.trim(),
        phone: phoneNumber.trim(),
        email: userEmail || "customer@digeboy.id",
        shipping_address: {
          first_name: recipientName.trim(),
          phone: phoneNumber.trim(),
          address: shippingAddress.trim(),
        },
      },
      item_details: [
        ...items.map((item) => ({
          id: String(item.product.id),
          price: item.product.price,
          quantity: item.quantity,
          name: item.product.name.substring(0, 50),
        })),
        {
          id: "SHIPPING",
          price: shippingFee,
          quantity: 1,
          name: `Ongkir ${shippingMethod}`,
        },
        ...(discount > 0
          ? [
              {
                id: "DISCOUNT",
                price: -discount,
                quantity: 1,
                name: `Diskon Voucher ${appliedVoucher}`,
              },
            ]
          : []),
      ],
    };

    const snap = createSnap();
    const snapResponse = await snap.createTransaction(snapParam);

    // --- Update order dengan snapToken ---
    await adminDb.collection("orders").doc(orderId).update({
      snapToken: snapResponse.token,
      snapRedirectUrl: snapResponse.redirect_url,
    });

    return NextResponse.json({
      orderId,
      snapToken: snapResponse.token,
      snapRedirectUrl: snapResponse.redirect_url,
      isCod: false,
    });
  } catch (err) {
    console.error("[/api/checkout]", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat membuat pesanan.",
      },
      { status: 500 }
    );
  }
}
