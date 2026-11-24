import {
  collection, getDocs, addDoc, writeBatch, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  sold: number;
  location: string;
  category: string;
  emoji: string;
};

export const CATEGORIES = [
  "Fashion", "Sepatu", "Elektronik", "Aksesoris", "Rumah Tangga", "Kecantikan",
];

export const LOCATIONS = [
  "Jakarta", "Bandung", "Surabaya", "Medan", "Yogyakarta", "Semarang",
];

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
}

export async function addProduct(p: Omit<Product, "id">) {
  return addDoc(collection(db, "products"), { ...p, createdAt: serverTimestamp() });
}

// Data contoh: dipanggil sekali lewat tombol "Isi data contoh" saat koleksi masih kosong
export async function seedProducts() {
  const items: Omit<Product, "id">[] = [
    { name: "Nike Air Max Sneakers", price: 850000, originalPrice: 1100000, rating: 4.8, sold: 320, location: "Jakarta", category: "Sepatu", emoji: "👟" },
    { name: "Adidas Running Shoes", price: 720000, rating: 4.6, sold: 210, location: "Bandung", category: "Sepatu", emoji: "👟" },
    { name: "Sepatu Kets Canvas", price: 199000, rating: 4.2, sold: 980, location: "Surabaya", category: "Sepatu", emoji: "👞" },
    { name: "Headphone Wireless", price: 350000, originalPrice: 450000, rating: 4.5, sold: 540, location: "Jakarta", category: "Elektronik", emoji: "🎧" },
    { name: "Gamepad PS5", price: 1250000, rating: 4.9, sold: 150, location: "Medan", category: "Elektronik", emoji: "🎮" },
    { name: "Smartband Fitness", price: 275000, rating: 4.3, sold: 760, location: "Yogyakarta", category: "Elektronik", emoji: "⌚" },
    { name: "Speaker Bluetooth", price: 410000, rating: 4.4, sold: 330, location: "Bandung", category: "Elektronik", emoji: "🔊" },
    { name: "Celana Pendek Sport", price: 99000, originalPrice: 140000, rating: 4.1, sold: 1200, location: "Semarang", category: "Fashion", emoji: "🩳" },
    { name: "Kemeja Flanel Pria", price: 165000, rating: 4.0, sold: 430, location: "Bandung", category: "Fashion", emoji: "👔" },
    { name: "Dress Casual Wanita", price: 230000, rating: 4.7, sold: 610, location: "Jakarta", category: "Fashion", emoji: "👗" },
    { name: "Tas Ransel Laptop", price: 310000, rating: 4.6, sold: 890, location: "Surabaya", category: "Aksesoris", emoji: "🎒" },
    { name: "Topi Baseball", price: 59000, rating: 3.9, sold: 1500, location: "Medan", category: "Aksesoris", emoji: "🧢" },
    { name: "Kacamata Hitam", price: 120000, rating: 4.2, sold: 280, location: "Yogyakarta", category: "Aksesoris", emoji: "🕶️" },
    { name: "Blender Multifungsi", price: 450000, originalPrice: 520000, rating: 4.5, sold: 190, location: "Semarang", category: "Rumah Tangga", emoji: "🥤" },
    { name: "Lampu Meja LED", price: 89000, rating: 4.3, sold: 720, location: "Jakarta", category: "Rumah Tangga", emoji: "💡" },
    { name: "Serum Wajah Vitamin C", price: 135000, rating: 4.8, sold: 2100, location: "Bandung", category: "Kecantikan", emoji: "🧴" },
  ];
  const batch = writeBatch(db);
  items.forEach((it) => batch.set(doc(collection(db, "products")), { ...it, createdAt: serverTimestamp() }));
  await batch.commit();
}
