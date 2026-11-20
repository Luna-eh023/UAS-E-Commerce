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
};

type NewOrder = Omit<Order, "id">;

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
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  });
}

export function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getRefundDeadline(arrivedAt: string): Date {
  return new Date(
    new Date(arrivedAt).getTime() + REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
}

export function canRefund(order: Order): boolean {
  if (order.status !== "sampai" || !order.arrivedAt || order.refunded) {
    return false;
  }
  return Date.now() <= getRefundDeadline(order.arrivedAt).getTime();
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, ORDERS), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Order, "id">),
  }));
}

export async function backfillStoreLogos(orders: Order[]): Promise<Order[]> {
  return Promise.all(
    orders.map(async (order) => {
      const logo = STORE_LOGOS[order.storeName];
      if (order.storeLogo || !logo) return order;
      try {
        await updateDoc(doc(db, ORDERS, order.id), { storeLogo: logo });
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
        { name: "Earphone Bluetooth TWS", variant: "Hitam", price: 149000, qty: 1 },
        { name: "Kabel USB-C 1m", variant: "Putih", price: 25000, qty: 2 },
      ],
      "gudang",
      0,
      null
    ),
    makeOrder(
      "Gadget Mart",
      [{ name: "Mouse Wireless Slim", variant: "Abu-abu", price: 85000, qty: 1 }],
      "disortir",
      1,
      null
    ),
    makeOrder(
      "Kreasi Case ID",
      [{ name: "Casing HP Anti Crack", variant: "Biru", price: 35000, qty: 2 }],
      "diantar",
      2,
      null
    ),
    makeOrder(
      "TechZone Official",
      [{ name: "Power Bank 10000mAh", variant: "Hitam", price: 189000, qty: 1 }],
      "sampai",
      4,
      1
    ),
    makeOrder(
      "Gadget Mart",
      [{ name: "Keyboard Mekanik", variant: "Blue Switch", price: 275000, qty: 1 }],
      "sampai",
      8,
      5
    ),
  ];

  await Promise.all(samples.map((o) => addDoc(collection(db, ORDERS), o)));
}
