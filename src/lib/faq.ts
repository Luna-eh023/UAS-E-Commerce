import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  href: string | null;
  hrefLabel: string;
};

export type HelpType = "chat" | "laporan";

type NewFaq = Omit<FaqItem, "id">;

const FAQS = "faqs";
const HELP_MESSAGES = "helpMessages";

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export async function getFaqs(): Promise<FaqItem[]> {
  const q = query(collection(db, FAQS), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FaqItem, "id">),
    }))
    .filter((f) => typeof f.question === "string");
}

export async function sendHelpMessage(
  type: HelpType,
  message: string
): Promise<void> {
  await addDoc(collection(db, HELP_MESSAGES), {
    type,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  });
}

export async function seedFaqs(): Promise<void> {
  const samples: NewFaq[] = [
    {
      question: "Pengembalian Dana (Refund) Belum Diterima",
      answer:
        "Pengajuan refund diproses setelah kamu menekan tombol Kembalikan Dana pada pesanan yang sudah sampai. Dana hanya bisa dikembalikan maksimal 3 hari setelah pesanan sampai tujuan. Pastikan statusnya sudah berubah menjadi Dana Dikembalikan di halaman Status Pesanan.",
      order: 1,
      href: "/orders",
      hrefLabel: "Buka Status Pesanan",
    },
    {
      question: "Cara Mengajukan Pengembalian Dana",
      answer:
        "Buka halaman Status Pesanan, cari pesanan yang berstatus Sampai Tujuan, lalu klik Kembalikan Dana dan konfirmasi. Tombol ini hanya muncul sampai 3 hari setelah tanggal pesanan sampai.",
      order: 2,
      href: "/orders",
      hrefLabel: "Selengkapnya",
    },
    {
      question: "Saya Belum Menerima Pesanan",
      answer:
        "Cek posisi pesananmu di halaman Status Pesanan. Pesanan melewati empat tahap: Di Gudang, Disortir, Sedang Diantar, lalu Sampai Tujuan. Jika pesanan terasa terlalu lama, kirim pertanyaan lewat tombol Mulai Chat.",
      order: 3,
      href: "/orders",
      hrefLabel: "Lacak Pesanan",
    },
    {
      question: "Cara Menulis Ulasan Produk",
      answer:
        "Setelah pesanan berstatus Sampai Tujuan, tombol Tulis Ulasan akan muncul pada pesanan tersebut. Pilih jumlah bintang, tulis komentar jika mau, lalu kirim.",
      order: 4,
      href: "/orders",
      hrefLabel: "Selengkapnya",
    },
    {
      question: "Cara Membeli Lagi Barang yang Sama",
      answer:
        "Pada pesanan yang sudah sampai, klik tombol Beli Lagi. Pesanan baru dengan barang yang sama akan dibuat dan muncul di tab Di Gudang.",
      order: 5,
      href: "/orders",
      hrefLabel: "Selengkapnya",
    },
    {
      question: "Di Mana Saya Bisa Melihat Notifikasi Pesanan dan Promo",
      answer:
        "Semua kabar pesanan, chat, dan promo ada di halaman Notifikasi. Klik Tandai semua dibaca untuk merapikan notifikasi yang sudah kamu lihat.",
      order: 6,
      href: "/notifikasi",
      hrefLabel: "Buka Notifikasi",
    },
    {
      question: "Cara Mengganti Tampilan Gelap atau Terang",
      answer:
        "Klik tombol Mode Gelap atau Mode Terang di pojok kanan atas. Pilihanmu akan diingat saat kamu membuka Digeboy lagi.",
      order: 7,
      href: null,
      hrefLabel: "",
    },
    {
      question: "Cara Menghubungi Tim Digeboy Care",
      answer:
        "Klik Mulai Chat di pojok kanan bawah halaman ini, tulis pertanyaanmu, lalu kirim. Untuk laporan penipuan, gunakan tombol Laporkan di bagian bawah halaman.",
      order: 8,
      href: null,
      hrefLabel: "",
    },
  ];

  await Promise.all(samples.map((s) => addDoc(collection(db, FAQS), s)));
}
