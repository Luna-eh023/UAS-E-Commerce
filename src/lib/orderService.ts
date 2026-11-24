
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";

export async function getOrders() {
  try {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);

    const orders = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return orders;
  } catch (error) {
    console.error("Gagal mengambil orders:", error);
    throw error;
  }
}

export async function getOrderById(id: string) {
  try {
    const orderRef = doc(db, "orders", id);
    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Gagal mengambil detail pesanan:", error);
    throw error;
  }
}

export async function getOrdersByUser(userId: string) {
  try {
    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  } catch (error) {
    console.error("Gagal mengambil pesanan pengguna:", error);
    throw error;
  }
}

/* ======================================================================
 * Pesanan yang dilacak (halaman Lacak Barang) -- disimpan 7 hari
 * ====================================================================== */

/** Lama pesanan disimpan di Firestore (hari). */
export const ORDER_RETENTION_DAYS = 7;

export type OrderStatusKey = "dibuat" | "dikemas" | "dikirim" | "sampai";

export const ORDER_STATUS_LABEL: Record<OrderStatusKey, string> = {
  dibuat: "Pesanan dibuat",
  dikemas: "Sedang dikemas",
  dikirim: "Dalam perjalanan",
  sampai: "Pesanan selesai",
};

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
  variant?: string | null;
}

export interface TrackingStep {
  title: string;
  description: string;
  date: string;
  done: boolean;
}

/** Bentuk pesanan yang dipakai halaman Lacak Barang. */
export interface TrackedOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  category: string;
  image: string;
  courier: string;
  estimate: string;
  statusKey: OrderStatusKey;
  status: string; // label untuk ditampilkan
  items: OrderItem[];
  steps: TrackingStep[];
  createdAt: Date;
  expireAt: Date | null;
}

/** Data yang disimpan ke koleksi `orders`. */
export interface NewOrderInput {
  userId: string;
  orderNumber: string;
  storeName: string;
  category?: string;
  image?: string;
  courier?: string;
  estimate?: string;
  status: OrderStatusKey;
  items: OrderItem[];
  steps?: TrackingStep[];
  createdAt?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function getOrderExpireAt(): Timestamp {
  return Timestamp.fromMillis(Date.now() + ORDER_RETENTION_DAYS * DAY_MS);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function normalizeStatus(raw: unknown): OrderStatusKey {
  const value = String(raw ?? "").toLowerCase();

  if (["sampai", "selesai", "diterima", "pesanan selesai"].includes(value))
    return "sampai";
  if (["dikirim", "dalam perjalanan", "shipping"].includes(value))
    return "dikirim";
  if (["dikemas", "diproses", "sedang dikemas", "packing"].includes(value))
    return "dikemas";

  return "dibuat";
}

export function formatOrderDate(date: Date): string {
  const day = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  return `${day}, ${hh}:${mm}`;
}

const STEP_DEFS: { title: string; done: string; todo: string }[] = [
  {
    title: "Pesanan dibuat",
    done: "Pesanan berhasil dibuat oleh pembeli.",
    todo: "Pesanan berhasil dibuat dan menunggu proses penjual.",
  },
  {
    title: "Pesanan dikemas",
    done: "Penjual sedang menyiapkan paket.",
    todo: "Menunggu penjual menyiapkan paket.",
  },
  {
    title: "Diserahkan ke kurir",
    done: "Paket sudah diterima oleh pihak kurir.",
    todo: "Paket akan diserahkan kepada kurir.",
  },
  {
    title: "Dalam perjalanan",
    done: "Paket sedang dikirim menuju alamat tujuan.",
    todo: "Paket akan dikirim menuju alamat tujuan.",
  },
  {
    title: "Pesanan diterima",
    done: "Paket sudah sampai ke pembeli.",
    todo: "Paket sudah sampai ke pembeli.",
  },
];

const STEPS_DONE_BY_STATUS: Record<OrderStatusKey, number> = {
  dibuat: 1,
  dikemas: 2,
  dikirim: 4,
  sampai: 5,
};

/** Riwayat pengiriman bawaan jika dokumen tidak punya `steps`. */
function buildDefaultSteps(
  status: OrderStatusKey,
  createdAt: Date,
  arrivedAt: Date | null
): TrackingStep[] {
  const doneCount = STEPS_DONE_BY_STATUS[status];

  return STEP_DEFS.map((step, index) => {
    const done = index < doneCount;
    let date = "Belum tersedia";

    if (done && index === 0) date = formatOrderDate(createdAt);
    else if (done && index === 4 && arrivedAt) date = formatOrderDate(arrivedAt);
    else if (done) date = "Sudah tercatat";

    return {
      title: step.title,
      description: done ? step.done : step.todo,
      date,
      done,
    };
  });
}

function mapOrder(id: string, data: Record<string, unknown>): TrackedOrder {
  const statusKey = normalizeStatus(data.status);
  const createdAt = toDate(data.createdAt) ?? new Date();
  const arrivedAt = toDate(data.arrivedAt);

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: OrderItem[] = rawItems.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      name: String(row.name ?? "Produk"),
      price: Number(row.price ?? 0),
      qty: Number(row.qty ?? 1),
      variant: row.variant ? String(row.variant) : null,
    };
  });

  const steps =
    Array.isArray(data.steps) && data.steps.length > 0
      ? (data.steps as TrackingStep[])
      : buildDefaultSteps(statusKey, createdAt, arrivedAt);

  return {
    id,
    orderNumber: String(data.orderNumber ?? id.slice(-8).toUpperCase()),
    storeName: String(data.storeName ?? "Digeboy Store"),
    category: String(data.category ?? "Produk"),
    image: String(data.image ?? ""),
    courier: String(data.courier ?? "-"),
    estimate: String(data.estimate ?? "-"),
    statusKey,
    status: ORDER_STATUS_LABEL[statusKey],
    items,
    steps,
    createdAt,
    expireAt: toDate(data.expireAt),
  };
}

/**
 * Simpan pesanan baru. `expireAt` (+7 hari) dipakai oleh Firestore TTL untuk
 * menghapus pesanan otomatis. createdAt disimpan sebagai string ISO agar sama
 * dengan dokumen `orders` yang sudah ada.
 */
export async function saveOrder(input: NewOrderInput, orderId?: string) {
  try {
    const ordersRef = collection(db, "orders");
    const orderRef = orderId ? doc(ordersRef, orderId) : doc(ordersRef);
    const createdAt = input.createdAt ?? new Date();

    await setDoc(orderRef, {
      userId: input.userId,
      orderNumber: input.orderNumber,
      storeName: input.storeName,
      category: input.category ?? "Produk",
      image: input.image ?? "",
      courier: input.courier ?? "-",
      estimate: input.estimate ?? "-",
      status: input.status,
      items: input.items,
      steps:
        input.steps ?? buildDefaultSteps(input.status, createdAt, null),
      createdAt: createdAt.toISOString(),
      arrivedAt: null,
      refunded: false,
      refundedAt: null,
      review: null,
      expireAt: getOrderExpireAt(),
    });

    return orderRef.id;
  } catch (error) {
    console.error("Gagal menyimpan pesanan:", error);
    throw error;
  }
}

/**
 * Dengarkan pesanan milik satu pengunjung secara realtime.
 * Pesanan yang sudah lewat `expireAt` (7 hari) disembunyikan.
 * (Hanya satu filter `userId`, jadi tidak perlu composite index.)
 */
export function subscribeToUserOrders(
  userId: string,
  onData: (orders: TrackedOrder[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const now = Date.now();

      const orders = snapshot.docs
        .map((document) => mapOrder(document.id, document.data()))
        .filter((order) => !order.expireAt || order.expireAt.getTime() > now)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      onData(orders);
    },
    (error) => {
      console.error("Gagal membaca pesanan:", error);
      onError?.(error);
    }
  );
}

/**
 * Menyimpan 3 pesanan contoh ke Firestore satu kali per pengunjung,
 * supaya halaman Lacak Barang langsung berisi data yang tersimpan di database.
 * Setelah 7 hari pesanan terhapus otomatis (TTL) dan tidak dibuat ulang.
 */
export async function seedDemoOrdersOnce(userId: string) {
  const flagKey = `digeboy-orders-seeded-${userId}`;

  try {
    if (localStorage.getItem(flagKey)) return;
  } catch {
    return; // tanpa localStorage kita tidak bisa menandai -> jangan seed
  }

  const now = Date.now();
  const ago = (hours: number) => new Date(now - hours * 60 * 60 * 1000);
  const ahead = (days: number) =>
    new Date(now + days * DAY_MS).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const step = (
    index: number,
    done: boolean,
    at?: Date
  ): TrackingStep => ({
    title: STEP_DEFS[index].title,
    description: done ? STEP_DEFS[index].done : STEP_DEFS[index].todo,
    date: done && at ? formatOrderDate(at) : "Belum tersedia",
    done,
  });

  const demos: { id: string; data: NewOrderInput }[] = [
    {
      id: "DGB001",
      data: {
        userId,
        orderNumber: "DGB001",
        storeName: "TechStore Official",
        category: "Shoes",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        courier: "J&T Express",
        estimate: ahead(1),
        status: "dikirim",
        items: [{ name: "Classic Sneakers", price: 459000, qty: 1 }],
        createdAt: ago(72),
        steps: [
          step(0, true, ago(72)),
          step(1, true, ago(69)),
          step(2, true, ago(66)),
          step(3, true, ago(62)),
          step(4, false),
        ],
      },
    },
    {
      id: "DGB002",
      data: {
        userId,
        orderNumber: "DGB002",
        storeName: "Fashion House",
        category: "Accessories",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        courier: "SiCepat",
        estimate: ahead(2),
        status: "dikemas",
        items: [{ name: "Minimalist Watch", price: 329000, qty: 1 }],
        createdAt: ago(48),
        steps: [
          step(0, true, ago(48)),
          step(1, true, ago(45)),
          step(2, false),
          step(3, false),
          step(4, false),
        ],
      },
    },
    {
      id: "DGB003",
      data: {
        userId,
        orderNumber: "DGB003",
        storeName: "Bag Collection",
        category: "Bags",
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        courier: "J&T Express",
        estimate: ahead(4),
        status: "dibuat",
        items: [{ name: "Everyday Backpack", price: 275000, qty: 1 }],
        createdAt: ago(2),
        steps: [
          step(0, true, ago(2)),
          step(1, false),
          step(2, false),
          step(3, false),
          step(4, false),
        ],
      },
    },
  ];

  try {
    await Promise.all(
      demos.map((demo) => saveOrder(demo.data, `${userId}_${demo.id}`))
    );
    localStorage.setItem(flagKey, "1");
  } catch (error) {
    console.error("Gagal menyimpan pesanan contoh:", error);
    throw error;
  }
}
