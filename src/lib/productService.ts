
import {
  collection,
  getDocs,
  doc,
  getDoc,
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
