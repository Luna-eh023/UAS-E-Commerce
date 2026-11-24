// src/lib/account.ts
// Firestore functions for the Geboy account area (Profile, Voucher, Bonus Coin).
// There is no login yet, so everything is saved under one demo user: users/bunga
import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const DEMO_USER_ID = "bunga"; // teammates: replace with the real logged-in user id later
export const DAILY_COIN = 5;
// Where the logo and "Pakai Nanti" go. Change to "/storeinfo" if that page exists in your project.
export const SHOP_URL = "/";

export type Gender = "Laki-laki" | "Perempuan" | "Lainnya";
export type VoucherCategory = "Geboy" | "GeboyVIP" | "Toko" | "GeboyFood";

export interface UserAccount {
  username: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  gender: Gender;
  photoURL: string; // small base64 image, "" if none
  coins: number;
  coinExpiry: string; // "YYYY-MM-DD"
  lastClaimDate: string; // "YYYY-MM-DD" of last daily claim, "" if never
}

export interface Voucher {
  id: string; // same as code
  title: string;
  minSpend: number;
  code: string;
  category: VoucherCategory;
  validUntil: string; // "YYYY-MM-DD"
}

export interface CoinEntry {
  id: string;
  amount: number;
  note: string;
  createdAt: number; // Date.now()
}

// Codes people can type into "Tambah Voucher". Add more here.
const VOUCHER_CATALOG: Record<string, Omit<Voucher, "id">> = {
  FLOWER22: { title: "Diskon Rp5RB", minSpend: 198000, code: "FLOWER22", category: "Toko", validUntil: "2026-12-31" },
  BAJU1: { title: "Diskon Rp10RB", minSpend: 50000, code: "BAJU1", category: "Toko", validUntil: "2027-01-31" },
  GEBOY10: { title: "Diskon Rp10RB", minSpend: 100000, code: "GEBOY10", category: "Geboy", validUntil: "2027-03-31" },
  GEBOYVIP: { title: "Diskon Rp50RB", minSpend: 500000, code: "GEBOYVIP", category: "GeboyVIP", validUntil: "2027-06-30" },
  MAKAN15: { title: "Diskon Rp15RB", minSpend: 80000, code: "MAKAN15", category: "GeboyFood", validUntil: "2027-02-28" },
};

const userRef = () => doc(db, "users", DEMO_USER_ID);

export const todayStr = () => new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"
export const fmtDate = (iso: string, sep = ".") => iso.split("-").reverse().join(sep);
export const shortRupiah = (n: number) => (n >= 1000 ? `Rp${Math.round(n / 1000)}RB` : `Rp${n}`);

/** Creates the demo account (profile, 30 coins, 2 vouchers) the first time the app runs. */
export async function ensureAccount(): Promise<void> {
  const snap = await getDoc(userRef());
  if (snap.exists()) return;
  const account: UserAccount = {
    username: "bunga",
    name: "Bunga Apriyanti",
    email: "bunga123@gmail.com",
    phone: "08589333333",
    storeName: "Sembako",
    gender: "Perempuan",
    photoURL: "",
    coins: 30,
    coinExpiry: "2026-12-31",
    lastClaimDate: "",
  };
  await setDoc(userRef(), account);
  // fixed ids so React strict mode (runs effects twice in dev) cannot create duplicates
  await setDoc(doc(userRef(), "coinHistory", "signup"), {
    amount: 30,
    note: "Bonus pendaftaran",
    createdAt: Date.now(),
  });
  await setDoc(doc(userRef(), "vouchers", "FLOWER22"), VOUCHER_CATALOG.FLOWER22);
  await setDoc(doc(userRef(), "vouchers", "BAJU1"), VOUCHER_CATALOG.BAJU1);
}

/* ---------- Profile ---------- */
export async function updateProfile(
  data: Pick<UserAccount, "name" | "email" | "phone" | "storeName" | "gender" | "photoURL">
): Promise<void> {
  await updateDoc(userRef(), data);
}

/* ---------- Vouchers ---------- */
export async function addVoucherByCode(raw: string): Promise<void> {
  const code = raw.trim().toUpperCase();
  if (!code) throw new Error("Masukkan kode voucher.");
  const voucher = VOUCHER_CATALOG[code];
  if (!voucher) throw new Error("Kode voucher tidak ditemukan.");
  const ref = doc(userRef(), "vouchers", code);
  if ((await getDoc(ref)).exists()) throw new Error("Voucher ini sudah kamu miliki.");
  await setDoc(ref, voucher);
}

export async function deleteVoucher(id: string): Promise<void> {
  await deleteDoc(doc(userRef(), "vouchers", id));
}

export function watchVouchers(cb: (list: Voucher[]) => void, onError?: (msg: string) => void) {
  return onSnapshot(
    collection(userRef(), "vouchers"),
    (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as Omit<Voucher, "id">), id: d.id }))),
    (err) => onError?.(err.message)
  );
}

/* ---------- Coins ---------- */
/** Adds coins + writes a history line. Teammates can call this from checkout too (e.g. cashback). */
export async function addCoins(amount: number, note: string): Promise<void> {
  await updateDoc(userRef(), { coins: increment(amount) });
  await addDoc(collection(userRef(), "coinHistory"), { amount, note, createdAt: Date.now() });
}

export async function claimDailyCoin(): Promise<void> {
  const snap = await getDoc(userRef());
  const acc = snap.data() as UserAccount;
  if (acc.lastClaimDate === todayStr()) {
    throw new Error("Bonus hari ini sudah diklaim. Kembali lagi besok!");
  }
  await updateDoc(userRef(), { coins: increment(DAILY_COIN), lastClaimDate: todayStr() });
  await addDoc(collection(userRef(), "coinHistory"), {
    amount: DAILY_COIN,
    note: "Bonus Coin Harian",
    createdAt: Date.now(),
  });
}

export function watchCoinHistory(cb: (list: CoinEntry[]) => void, onError?: (msg: string) => void) {
  return onSnapshot(
    collection(userRef(), "coinHistory"),
    (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as Omit<CoinEntry, "id">), id: d.id }));
      cb(list.sort((a, b) => b.createdAt - a.createdAt));
    },
    (err) => onError?.(err.message)
  );
}
