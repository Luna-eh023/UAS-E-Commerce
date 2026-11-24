export type CartLine = {
  productId: string;
  storeName: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
};

const KEY = "cart";

// Only call these from the browser (event handlers or useEffect).
export function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function addToCart(line: CartLine, maxQty: number): boolean {
  try {
    const cart = readCart();
    const existing = cart.find((l) => l.productId === line.productId && l.variant === line.variant);
    if (existing) existing.qty = Math.min(maxQty, existing.qty + line.qty);
    else cart.push(line);
    localStorage.setItem(KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    return true;
  } catch {
    return false;
  }
}

export function cartCount(): number {
  return readCart().reduce((n, l) => n + l.qty, 0);
}
