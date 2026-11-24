import {
  collection, doc, setDoc, deleteDoc, onSnapshot, increment, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./products";

// Struktur data:
//   users/{uid}/wishlist/{productId}  -> salinan data produk
//   users/{uid}/cart/{productId}      -> salinan data produk + qty
const wishRef = (uid: string, pid: string) => doc(db, "users", uid, "wishlist", pid);
const cartRef = (uid: string, pid: string) => doc(db, "users", uid, "cart", pid);

const snapshot = ({ id, ...rest }: Product) => rest;

export function listenWishlist(uid: string, cb: (items: Product[]) => void) {
  return onSnapshot(collection(db, "users", uid, "wishlist"), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) })))
  );
}

export function listenCartCount(uid: string, cb: (count: number) => void) {
  return onSnapshot(collection(db, "users", uid, "cart"), (snap) =>
    cb(snap.docs.reduce((sum, d) => sum + (d.data().qty ?? 1), 0))
  );
}

export const addToWishlist = (uid: string, p: Product) =>
  setDoc(wishRef(uid, p.id), { ...snapshot(p), addedAt: serverTimestamp() });

export const removeFromWishlist = (uid: string, pid: string) => deleteDoc(wishRef(uid, pid));

export const addToCart = (uid: string, p: Product) =>
  setDoc(cartRef(uid, p.id), { ...snapshot(p), qty: increment(1), addedAt: serverTimestamp() }, { merge: true });

// Pindahkan ke keranjang: tambah ke cart sekaligus hapus dari wishlist (atomik)
export async function moveToCart(uid: string, p: Product) {
  const batch = writeBatch(db);
  batch.set(cartRef(uid, p.id), { ...snapshot(p), qty: increment(1), addedAt: serverTimestamp() }, { merge: true });
  batch.delete(wishRef(uid, p.id));
  await batch.commit();
}
