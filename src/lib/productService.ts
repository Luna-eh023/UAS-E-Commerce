
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";

export async function getProducts() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const products = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return products;
  } catch (error) {
    console.error("Gagal mengambil products:", error);
    throw error;
  }
}

export async function getProductById(id: string) {
  try {
    const productRef = doc(db, "products", id);
    const snapshot = await getDoc(productRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Gagal mengambil detail produk:", error);
    throw error;
  }
}

/* ======================================================================
 * Produk halaman Search -- disimpan 7 hari
 * ====================================================================== */

/** Lama produk yang dibuat halaman Search disimpan di Firestore (hari). */
export const PRODUCT_RETENTION_DAYS = 7;

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  image: string;
  emoji: string;
  sellerName: string;
  sellerImage: string;
  location: string;
  price: number | null;
  rating: number | null;
  sold: number | null;
  createdAt: Date | null;
  expireAt: Date | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapProduct(id: string, data: Record<string, unknown>): ProductRecord {
  return {
    id,
    name: String(data.name ?? "Produk"),
    category: String(data.category ?? "Lainnya"),
    image: String(data.image ?? ""),
    emoji: String(data.emoji ?? ""),
    sellerName: String(data.sellerName ?? ""),
    sellerImage: String(data.sellerImage ?? ""),
    location: String(data.location ?? ""),
    price: toNumberOrNull(data.price),
    rating: toNumberOrNull(data.rating),
    sold: toNumberOrNull(data.sold),
    createdAt: toDate(data.createdAt),
    expireAt: toDate(data.expireAt),
  };
}

/**
 * Dengarkan koleksi `products` secara realtime.
 * Produk yang punya `expireAt` dan sudah lewat (7 hari) disembunyikan.
 * Produk lama tanpa `expireAt` tetap tampil.
 */
export function subscribeToProducts(
  onData: (products: ProductRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const now = Date.now();

      const products = snapshot.docs
        .map((document) =>
          mapProduct(document.id, document.data({ serverTimestamps: "estimate" }))
        )
        .filter((product) => !product.expireAt || product.expireAt.getTime() > now)
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );

      onData(products);
    },
    (error) => {
      console.error("Gagal membaca produk:", error);
      onError?.(error);
    }
  );
}

/** Produk bawaan halaman Search (dulu hardcode di SearchPage.tsx). */
const SEED_PRODUCTS = [
  {
    id: "search_powerbank-10000mah",
    name: "Powerbank 10.000 mAh",
    category: "Elektronik",
    image: "/images/powerbank10000mah.webp",
    sellerName: "Seller 1",
    sellerImage: "/images/pppenjual1.jpg",
  },
  {
    id: "search_mouse-wireless-logitech",
    name: "Mouse Wireless Logitech",
    category: "Aksesoris",
    image: "/images/mousewireless.webp",
    sellerName: "Seller 3",
    sellerImage: "/images/pppenjual3.jpg",
  },
  {
    id: "search_keyboard-mekanik",
    name: "Keyboard Mekanik",
    category: "Aksesoris",
    image: "/images/keyboardmekanik.jpg",
    sellerName: "Seller 4",
    sellerImage: "/images/pppenjual4.jpg",
  },
  {
    id: "search_kabel-usb",
    name: "Kabel USB",
    category: "Aksesoris",
    image: "/images/kabelusb.jpg",
    sellerName: "Seller 5",
    sellerImage: "/images/pppenjual5.jpg",
  },
  {
    id: "search_casing-hp-transparan",
    name: "Casing HP Transparan",
    category: "Aksesoris",
    image: "/images/casinghp.jpg",
    sellerName: "Seller 6",
    sellerImage: "/images/pppenjual6.jpg",
  },
  {
    id: "search_tws-wireless-earbuds",
    name: "TWS Wireless Earbuds",
    category: "Elektronik",
    image: "/images/tws.jpg",
    sellerName: "Seller 7",
    sellerImage: "/images/pppenjual7.jpg",
  },
];

/**
 * Simpan produk bawaan yang belum ada (atau sudah kedaluwarsa) ke Firestore.
 * `liveIds` = ID dokumen yang saat ini tampil. Tiap produk diberi
 * `expireAt` = sekarang + 7 hari untuk Firestore TTL. Setelah terhapus,
 * produk dibuat lagi saat halaman dibuka berikutnya.
 */
export async function seedSearchProductsIfMissing(liveIds: Set<string>) {
  const missing = SEED_PRODUCTS.filter((product) => !liveIds.has(product.id));

  if (missing.length === 0) return;

  try {
    const expireAt = Timestamp.fromMillis(
      Date.now() + PRODUCT_RETENTION_DAYS * DAY_MS
    );

    await Promise.all(
      missing.map(({ id, ...data }) =>
        setDoc(doc(db, "products", id), {
          ...data,
          createdAt: serverTimestamp(),
          expireAt,
        })
      )
    );
  } catch (error) {
    console.error("Gagal menyimpan produk:", error);
    throw error;
  }
}
