
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
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
