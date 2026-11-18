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

export type NotifType = "pesanan" | "chat" | "promo";

export type AppNotification = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  image: string | null;
  href: string | null;
  actionLabel: string;
};

type NewNotification = Omit<AppNotification, "id">;

const NOTIFICATIONS = "notifications";

const HOUR = 60 * 60 * 1000;

export const GROUP_ORDER = ["Hari Ini", "Minggu Ini", "Bulan Ini", "Lebih Lama"];

export const TYPE_LABEL: Record<NotifType, string> = {
  pesanan: "Pesanan",
  chat: "Chat",
  promo: "Promo",
};

export const TYPE_COLOR: Record<NotifType, string> = {
  pesanan: "success",
  chat: "info",
  promo: "danger",
};

export function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export function groupLabel(iso: string): string {
  const hours = (Date.now() - new Date(iso).getTime()) / HOUR;
  if (hours < 24) return "Hari Ini";
  if (hours < 24 * 7) return "Minggu Ini";
  if (hours < 24 * 30) return "Bulan Ini";
  return "Lebih Lama";
}

export async function getNotifications(): Promise<AppNotification[]> {
  const q = query(collection(db, NOTIFICATIONS), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AppNotification, "id">),
    }))
    .filter((n) => typeof n.title === "string");
}

export async function markRead(id: string): Promise<void> {
  await updateDoc(doc(db, NOTIFICATIONS, id), { read: true });
}

export async function markAllRead(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => markRead(id)));
}

function make(
  type: NotifType,
  title: string,
  message: string,
  hoursAgo: number,
  read: boolean,
  image: string | null,
  href: string | null,
  actionLabel: string
): NewNotification {
  return {
    type,
    title,
    message,
    createdAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
    read,
    image,
    href,
    actionLabel,
  };
}

export async function seedNotifications(): Promise<void> {
  const samples: NewNotification[] = [
    make(
      "pesanan",
      "Pesanan sedang diantar",
      "Earphone Bluetooth TWS dari TechZone Official sedang dalam perjalanan ke alamatmu.",
      0.6,
      false,
      "/images/tws.jpg",
      "/orders",
      "Lihat Pesanan"
    ),
    make(
      "chat",
      "TechZone Official",
      "Halo kak, pesanan kakak sudah kami kemas dan akan segera dikirim ya.",
      1.5,
      false,
      null,
      null,
      ""
    ),
    make(
      "promo",
      "Flash Sale dimulai!",
      "Diskon hingga 70% untuk aksesoris gadget. Berakhir pukul 23.59 malam ini.",
      3,
      false,
      null,
      "/",
      "Lihat Promo"
    ),
    make(
      "pesanan",
      "Pesanan sedang disortir",
      "Mouse Wireless Slim dari Gadget Mart sedang disortir di pusat sortir.",
      20,
      false,
      "/images/mousewireless.webp",
      "/orders",
      "Lihat Pesanan"
    ),
    make(
      "pesanan",
      "Pesanan tiba di gudang",
      "Casing HP Anti Crack dari Kreasi Case ID sudah diterima gudang dan menunggu disortir.",
      30,
      true,
      "/images/casinghp.jpg",
      "/orders",
      "Lihat Pesanan"
    ),
    make(
      "chat",
      "Rina Putri",
      "Kak, power bank 10000mAh ini masih ready stok?",
      72,
      true,
      null,
      null,
      ""
    ),
    make(
      "pesanan",
      "Pesanan telah sampai",
      "Power Bank 10000mAh dari TechZone Official telah sampai. Jangan lupa beri ulasan, ya.",
      96,
      true,
      "/images/powerbank10000mah.webp",
      "/orders",
      "Beri Ulasan"
    ),
    make(
      "promo",
      "Gratis Ongkir Seluruh Indonesia",
      "Belanja minimal Rp100.000 dan nikmati gratis ongkir tanpa batas hari ini.",
      24 * 6,
      true,
      null,
      "/",
      "Belanja Sekarang"
    ),
    make(
      "promo",
      "Flash Sale Keyboard Mekanik",
      "Keyboard Mekanik Blue Switch diskon 40% hanya sampai stok habis.",
      24 * 14,
      true,
      "/images/keyboardmekanik.jpg",
      "/",
      "Lihat Promo"
    ),
  ];

  await Promise.all(samples.map((s) => addDoc(collection(db, NOTIFICATIONS), s)));
}
