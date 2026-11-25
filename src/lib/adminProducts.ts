
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AdminProduct = {
  docId: string;
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

export type AdminProductInput = {
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

const COLLECTION_NAME = "admin_products";

const productsCollection = collection(db, COLLECTION_NAME);

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const snapshot = await getDocs(productsCollection);

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      docId: item.id,
      id: data.id,
      name: data.name,
      category: data.category,
      price: data.price,
      image: data.image,
      description: data.description,
    };
  });
}

export async function addAdminProduct(
  product: AdminProductInput
): Promise<string> {
  const newProduct = {
    id: Date.now(),
    name: product.name.trim(),
    category: product.category.trim(),
    price: Number(product.price),
    image: product.image.trim(),
    description: product.description.trim(),
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(productsCollection, newProduct);

  return result.id;
}

export async function updateAdminProduct(
  docId: string,
  product: AdminProductInput
): Promise<void> {
  const productRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(productRef, {
    name: product.name.trim(),
    category: product.category.trim(),
    price: Number(product.price),
    image: product.image.trim(),
    description: product.description.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdminProduct(
  docId: string
): Promise<void> {
  const productRef = doc(db, COLLECTION_NAME, docId);

  await deleteDoc(productRef);
}
