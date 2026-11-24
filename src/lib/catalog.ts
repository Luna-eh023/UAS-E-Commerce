import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { PRODUCTS, STORES, type Product, type Store } from "./products";

const STORES_COL = "stores";
const PRODUCTS_COL = "products";

// The document ID in Firestore is the id used in the page address
function withId<T>(snap: { id: string; data(): unknown }): T {
  return { id: snap.id, ...(snap.data() as object) } as T;
}

export async function fetchStores(): Promise<Store[]> {
  const snap = await getDocs(collection(db, STORES_COL));
  return snap.docs.map((d) => withId<Store>(d));
}

export async function fetchStore(id: string): Promise<Store | null> {
  const snap = await getDoc(doc(db, STORES_COL, id));
  return snap.exists() ? withId<Store>(snap) : null;
}

export async function fetchProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, PRODUCTS_COL));
  return snap.docs.map((d) => withId<Product>(d));
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, PRODUCTS_COL, id));
  return snap.exists() ? withId<Product>(snap) : null;
}

export async function fetchProductsOfStore(storeId: string): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS_COL), where("storeId", "==", storeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Product>(d));
}

// Firestore rejects undefined values, so optional fields are dropped
const clean = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

/**
 * Writes the sample stores and products from products.ts into Firestore.
 * Uses fixed document IDs, so running it twice does not create duplicates,
 * but it DOES overwrite anything edited in the Firebase console.
 */
export async function seedCatalog(): Promise<void> {
  await Promise.all([
    ...STORES.map(({ id, ...rest }) => setDoc(doc(db, STORES_COL, id), clean(rest))),
    ...PRODUCTS.map(({ id, ...rest }) => setDoc(doc(db, PRODUCTS_COL, id), clean(rest))),
  ]);
}
