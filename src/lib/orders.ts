
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./products";

export type OrderStatus = "gudang" | "disortir" | "diantar" | "sampai";

export type OrderItem = {
  name: string;
  variant: string;
  price: number;
  qty: number;
};

export type Review = {
  rating: number;
  comment: string;
  createdAt: string;
};

export type PaymentStatus =
  | "cod"
  | "pending"
  | "paid"
  | "failed"
  | "expired";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  cod: "COD",
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  failed: "Pembayaran Gagal",
  expired: "Kadaluarsa",
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  cod: "secondary",
  pending: "warning",
  paid: "success",
  failed: "danger",
  expired: "dark",
};

export type Order = {
  id: string;
  storeName: string;
  storeLogo?: string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  arrivedAt: string | null;
  review: Review | null;
  refunded: boolean;
  refundedAt: string | null;

  recipientName?: string;
  phoneNumber?: string;
  shippingAddress?: string;
  shippingMethod?: string;
  shippingFee?: number;
  discount?: number;
  paymentMethod?: string;

  // Midtrans payment fields
  paymentStatus?: PaymentStatus;
  snapToken?: string;
  snapRedirectUrl?: string;
  midtransOrderId?: string;
  paidAt?: string;
};

type NewOrder = Omit<Order, "id">;

export type CheckoutData = {
  recipientName: string;
  phoneNumber: string;
  shippingAddress: string;
  shippingMethod: string;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
};

const ORDERS = "orders";

export const REFUND_WINDOW_DAYS = 3;

export const STATUS_FLOW: OrderStatus[] = [
  "gudang",
  "disortir",
  "diantar",
  "sampai",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  gudang: "Di Gudang",
  disortir: "Disortir",
  diantar: "Sedang Diantar",
  sampai: "Sampai Tujuan",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  gudang: "secondary",
  disortir: "info",
  diantar: "warning",
  sampai: "success",
};

const PRODUCT_IMAGES: Record<string, string> = {
  "Earphone Bluetooth TWS": "/images/tws.jpg",
  "Kabel USB-C 1m": "/images/kabelusb.jpg",
  "Mouse Wireless Slim": "/images/mousewireless.webp",
  "Casing HP Anti Crack": "/images/casinghp.jpg",
  "Power Bank 10000mAh": "/images/powerbank10000mah.webp",
  "Keyboard Mekanik": "/images/keyboardmekanik.jpg",
};

export function getItemImage(item: OrderItem): string | null {
  return PRODUCT_IMAGES[item.name] ?? null;
}

const STORE_LOGOS: Record<string, string> = {
  "TechZone Official": "/images/pppenjual1.jpg",
  "Gadget Mart": "/images/pppenjual3.jpg",
  "Kreasi Case ID": "/images/pppenjual4.jpg",
};

export function formatRupiah(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

export function formatTanggal(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  });
}

export function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    const price = Number.isFinite(item.price) ? item.price : 0;
    const qty = Number.isFinite(item.qty) ? item.qty : 0;

    return sum + price * qty;
  }, 0);
}

export function getRefundDeadline(arrivedAt: string): Date {
  return new Date(
    new Date(arrivedAt).getTime() +
      REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
}

export function canRefund(order: Order): boolean {
  if (order.status !== "sampai" || !order.arrivedAt || order.refunded) {
    return false;
  }

  const deadline = getRefundDeadline(order.arrivedAt);

  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  return Date.now() <= deadline.getTime();
}

// Normalisasi item order lama agar struktur data konsisten.
function normalizeItems(rawItems: unknown): OrderItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((rawItem) => {
    const item = rawItem as Record<string, unknown>;

    const name =
      typeof item.name === "string" && item.name.trim()
        ? item.name
        : "Produk";

    const variant =
      typeof item.variant === "string"
        ? item.variant
        : "-";

    const rawPrice = Number(item.price);
    const rawQty = Number(item.qty);

    const price =
      Number.isFinite(rawPrice) && rawPrice >= 0
        ? rawPrice
        : 0;

    const qty =
      Number.isFinite(rawQty) && rawQty >= 1
        ? Math.floor(rawQty)
        : 1;

    return {
      name,
      variant,
      price,
      qty,
    };
  });
}

// Normalisasi seluruh data order dari Firestore.
function normalizeOrder(id: string, rawData: Record<string, unknown>): Order {
  const items = normalizeItems(rawData.items);

  const rawTotal = Number(rawData.total);

  const total =
    Number.isFinite(rawTotal) && rawTotal >= 0
      ? rawTotal
      : calcTotal(items);

  const validStatus = STATUS_FLOW.includes(
    rawData.status as OrderStatus
  )
    ? (rawData.status as OrderStatus)
    : "gudang";

  const createdAt =
    typeof rawData.createdAt === "string" &&
    !Number.isNaN(new Date(rawData.createdAt).getTime())
      ? rawData.createdAt
      : new Date().toISOString();

  const arrivedAt =
    typeof rawData.arrivedAt === "string"
      ? rawData.arrivedAt
      : null;

  const review =
    rawData.review &&
    typeof rawData.review === "object"
      ? (rawData.review as Review)
      : null;

  return {
    id,
    storeName:
      typeof rawData.storeName === "string"
        ? rawData.storeName
        : "Digeboy Official",

    storeLogo:
      typeof rawData.storeLogo === "string"
        ? rawData.storeLogo
        : null,

    items,
    total,
    status: validStatus,
    createdAt,
    arrivedAt,
    review,

    refunded: rawData.refunded === true,

    refundedAt:
      typeof rawData.refundedAt === "string"
        ? rawData.refundedAt
        : null,

    recipientName:
      typeof rawData.recipientName === "string"
        ? rawData.recipientName
        : undefined,

    phoneNumber:
      typeof rawData.phoneNumber === "string"
        ? rawData.phoneNumber
        : undefined,

    shippingAddress:
      typeof rawData.shippingAddress === "string"
        ? rawData.shippingAddress
        : undefined,

    shippingMethod:
      typeof rawData.shippingMethod === "string"
        ? rawData.shippingMethod
        : undefined,

    shippingFee:
      rawData.shippingFee !== null &&
      rawData.shippingFee !== undefined &&
      rawData.shippingFee !== "" &&
      Number.isFinite(Number(rawData.shippingFee))
        ? Number(rawData.shippingFee)
        : undefined,

    discount:
      rawData.discount !== null &&
      rawData.discount !== undefined &&
      rawData.discount !== "" &&
      Number.isFinite(Number(rawData.discount))
        ? Number(rawData.discount)
        : undefined,

    paymentMethod:
      typeof rawData.paymentMethod === "string"
        ? rawData.paymentMethod
        : undefined,

    paymentStatus:
      typeof rawData.paymentStatus === "string"
        ? (rawData.paymentStatus as PaymentStatus)
        : undefined,

    snapToken:
      typeof rawData.snapToken === "string" ? rawData.snapToken : undefined,

    snapRedirectUrl:
      typeof rawData.snapRedirectUrl === "string"
        ? rawData.snapRedirectUrl
        : undefined,

    midtransOrderId:
      typeof rawData.midtransOrderId === "string"
        ? rawData.midtransOrderId
        : undefined,

    paidAt:
      typeof rawData.paidAt === "string" ? rawData.paidAt : undefined,
  };
}

// Membuat pesanan baru dari Checkout
export async function createOrder(
  products: { product: Product; quantity: number }[],
  checkout: CheckoutData
): Promise<string> {
  if (products.length === 0) {
    throw new Error("Keranjang belanja kosong.");
  }

  if (
    !checkout.recipientName.trim() ||
    !checkout.phoneNumber.trim() ||
    !checkout.shippingAddress.trim()
  ) {
    throw new Error("Informasi penerima dan alamat harus lengkap.");
  }

  if (
    !Number.isFinite(checkout.shippingFee) ||
    !Number.isFinite(checkout.discount) ||
    checkout.shippingFee < 0 ||
    checkout.discount < 0
  ) {
    throw new Error("Biaya pengiriman atau diskon tidak valid.");
  }

  const items: OrderItem[] = products.map(({ product, quantity }) => {
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      throw new Error("Data produk atau quantity tidak valid.");
    }

    return {
      name: product.name,
      variant: "-",
      price: product.price,
      qty: quantity,
    };
  });

  const subtotal = calcTotal(items);

  if (checkout.discount > subtotal) {
    throw new Error("Diskon melebihi subtotal belanja.");
  }

  const total = subtotal - checkout.discount + checkout.shippingFee;

  const newOrder: NewOrder = {
    storeName: "Digeboy Official",
    storeLogo: null,
    items,
    total,
    status: "gudang",
    createdAt: new Date().toISOString(),
    arrivedAt: null,
    review: null,
    refunded: false,
    refundedAt: null,

    recipientName: checkout.recipientName.trim(),
    phoneNumber: checkout.phoneNumber.trim(),
    shippingAddress: checkout.shippingAddress.trim(),
    shippingMethod: checkout.shippingMethod,
    shippingFee: checkout.shippingFee,
    discount: checkout.discount,
    paymentMethod: checkout.paymentMethod,
  };

  const docRef = await addDoc(collection(db, ORDERS), newOrder);

  return docRef.id;
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, ORDERS), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) =>
    normalizeOrder(d.id, d.data() as Record<string, unknown>)
  );
}

export async function backfillStoreLogos(orders: Order[]): Promise<Order[]> {
  return Promise.all(
    orders.map(async (order) => {
      const logo = STORE_LOGOS[order.storeName];

      if (order.storeLogo || !logo) return order;

      try {
        await updateDoc(doc(db, ORDERS, order.id), {
          storeLogo: logo,
        });
      } catch (err) {
        console.error(err);
      }

      return { ...order, storeLogo: logo };
    })
  );
}

export async function advanceStatus(order: Order): Promise<void> {
  const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  if (!next) return;

  await updateDoc(doc(db, ORDERS, order.id), {
    status: next,
    arrivedAt: next === "sampai" ? new Date().toISOString() : null,
  });
}

export async function submitReview(
  orderId: string,
  rating: number,
  comment: string
): Promise<void> {
  const review: Review = {
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, ORDERS, orderId), { review });
}

export async function refundOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, ORDERS, orderId), {
    refunded: true,
    refundedAt: new Date().toISOString(),
  });
}

export async function buyAgain(order: Order): Promise<void> {
  const newOrder: NewOrder = {
    storeName: order.storeName,
    storeLogo: order.storeLogo ?? STORE_LOGOS[order.storeName] ?? null,
    items: order.items,
    total: calcTotal(order.items),
    status: "gudang",
    createdAt: new Date().toISOString(),
    arrivedAt: null,
    review: null,
    refunded: false,
    refundedAt: null,
  };

  await addDoc(collection(db, ORDERS), newOrder);
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function makeOrder(
  storeName: string,
  items: OrderItem[],
  status: OrderStatus,
  createdDaysAgo: number,
  arrivedDaysAgo: number | null
): NewOrder {
  return {
    storeName,
    storeLogo: STORE_LOGOS[storeName] ?? null,
    items,
    total: calcTotal(items),
    status,
    createdAt: daysAgo(createdDaysAgo),
    arrivedAt: arrivedDaysAgo === null ? null : daysAgo(arrivedDaysAgo),
    review: null,
    refunded: false,
    refundedAt: null,
  };
}

export async function seedOrders(): Promise<void> {
  const samples: NewOrder[] = [
    makeOrder(
      "TechZone Official",
      [
        {
          name: "Earphone Bluetooth TWS",
          variant: "Hitam",
          price: 149000,
          qty: 1,
        },
        {
          name: "Kabel USB-C 1m",
          variant: "Putih",
          price: 25000,
          qty: 2,
        },
      ],
      "gudang",
      0,
      null
    ),

    makeOrder(
      "Gadget Mart",
      [
        {
          name: "Mouse Wireless Slim",
          variant: "Abu-abu",
          price: 85000,
          qty: 1,
        },
      ],
      "disortir",
      1,
      null
    ),

    makeOrder(
      "Kreasi Case ID",
      [
        {
          name: "Casing HP Anti Crack",
          variant: "Biru",
          price: 35000,
          qty: 2,
        },
      ],
      "diantar",
      2,
      null
    ),

    makeOrder(
      "TechZone Official",
      [
        {
          name: "Power Bank 10000mAh",
          variant: "Hitam",
          price: 189000,
          qty: 1,
        },
      ],
      "sampai",
      4,
      1
    ),

    makeOrder(
      "Gadget Mart",
      [
        {
          name: "Keyboard Mekanik",
          variant: "Blue Switch",
          price: 275000,
          qty: 1,
        },
      ],
      "sampai",
      8,
      5
    ),
  ];

  await Promise.all(samples.map((o) => addDoc(collection(db, ORDERS), o)));
}
