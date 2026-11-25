import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// =========================
// WISHLIST COLLECTION
// =========================

function wishlistCollection(uid: string) {
  return collection(db, "users", uid, "wishlist");
}

// =========================
// SUBSCRIBE WISHLIST
// =========================

export function subscribeToWishlist(
  uid: string,
  callback: (productIds: number[]) => void,
  onError?: (error: Error) => void
) {
  const wishlistRef = wishlistCollection(uid);

  return onSnapshot(
    wishlistRef,
    (snapshot) => {
      const productIds = snapshot.docs.map((item) =>
        Number(item.id)
      );

      callback(productIds);
    },
    (error) => {
      onError?.(error);
    }
  );
}

// =========================
// ADD WISHLIST
// =========================

export async function addToWishlist(
  uid: string,
  productId: number
) {
  const wishlistRef = doc(
    db,
    "users",
    uid,
    "wishlist",
    String(productId)
  );

  await setDoc(wishlistRef, {
    productId,
    createdAt: serverTimestamp(),
  });
}

// =========================
// REMOVE WISHLIST
// =========================

export async function removeFromWishlist(
  uid: string,
  productId: number
) {
  const wishlistRef = doc(
    db,
    "users",
    uid,
    "wishlist",
    String(productId)
  );

  await deleteDoc(wishlistRef);
}