export type Product = {
  id: string;
  name: string;
  storeId: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  variants: string[];
  rating: number;
  sold: number;
  ratingCount: number;
  favorites: number;
  images?: string[]; // add more image paths here to fill the thumbnail strip
  sizeLabel?: string;
  sizes?: string[];
  stock: number;
  tags: string[];
  description: string;
  specs: { label: string; value: string }[];
};

export type Store = {
  id: string;
  name: string;
  activeText: string;
  followers: string;
  following: number;
  rating: number;
  ratingCount: string;
  joined: string;
  chatPerformance: string;
};

// Placeholder data. Replace with real data (e.g. from Firestore) when you have it.
export const STORES: Store[] = [
  {
    id: "techzone-official",
    name: "TechZone Official",
    activeText: "Active 14 minutes ago",
    followers: "5.4k",
    following: 3,
    rating: 4.8,
    ratingCount: "31k",
    joined: "24 months ago",
    chatPerformance: "100% (within hours)",
  },
  {
    id: "gadget-mart",
    name: "Gadget Mart",
    activeText: "Active 1 hour ago",
    followers: "3.2k",
    following: 8,
    rating: 4.7,
    ratingCount: "18k",
    joined: "18 months ago",
    chatPerformance: "98% (within hours)",
  },
  {
    id: "kreasi-case-id",
    name: "Kreasi Case ID",
    activeText: "Active 3 hours ago",
    followers: "1.5k",
    following: 5,
    rating: 4.9,
    ratingCount: "9k",
    joined: "12 months ago",
    chatPerformance: "95% (within a day)",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "earphone-bluetooth-tws",
    name: "Earphone Bluetooth TWS",
    storeId: "techzone-official",
    category: "Audio",
    price: 149000,
    originalPrice: 199000,
    image: "/images/tws.jpg",
    variants: ["Hitam", "Putih"],
    rating: 4.8,
    sold: 5200,
    ratingCount: 1100,
    favorites: 420,
    stock: 120,
    tags: ["Local pick", "Free shipping"],
    description:
      "True wireless earphones with clear sound and a compact charging case.\n\nAuto-pairing connects the moment you open the case, and the touch controls let you play, pause and answer calls without reaching for your phone.",
    specs: [
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Battery life", value: "Up to 6 h (24 h with case)" },
      { label: "Water resistance", value: "IPX4" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    id: "kabel-usb-c-1m",
    name: "Kabel USB-C 1m",
    storeId: "techzone-official",
    category: "Cables",
    price: 25000,
    image: "/images/kabelusb.jpg",
    variants: ["Putih", "Hitam"],
    rating: 4.7,
    sold: 12000,
    ratingCount: 2300,
    favorites: 310,
    stock: 500,
    tags: ["Best seller"],
    description:
      "A durable 1 m USB-C cable for charging and data transfer.\n\nThe braided jacket resists bending and tangling, and it supports fast charging on compatible devices.",
    specs: [
      { label: "Length", value: "1 m" },
      { label: "Connector", value: "USB-C to USB-A" },
      { label: "Max charging", value: "3 A" },
      { label: "Warranty", value: "6 months" },
    ],
  },
  {
    id: "power-bank-10000mah",
    name: "Power Bank 10000mAh",
    storeId: "techzone-official",
    category: "Power",
    price: 189000,
    originalPrice: 219000,
    image: "/images/powerbank10000mah.webp",
    variants: ["Hitam", "Putih"],
    rating: 4.8,
    sold: 3100,
    ratingCount: 640,
    favorites: 260,
    stock: 80,
    tags: ["Local pick", "Fast charge"],
    description:
      "Slim 10000mAh power bank that charges a phone about two times over.\n\nTwo output ports let you charge two devices at once, and the built-in protection keeps charging safe.",
    specs: [
      { label: "Capacity", value: "10000 mAh" },
      { label: "Ports", value: "USB-C in/out, USB-A out" },
      { label: "Output", value: "Up to 22.5 W" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    id: "mouse-wireless-slim",
    name: "Mouse Wireless Slim",
    storeId: "gadget-mart",
    category: "Peripherals",
    price: 85000,
    image: "/images/mousewireless.webp",
    variants: ["Abu-abu", "Hitam"],
    rating: 4.7,
    sold: 2400,
    ratingCount: 480,
    favorites: 150,
    stock: 150,
    tags: ["Silent click"],
    description:
      "A slim wireless mouse with quiet buttons, good for the office or a study desk.\n\nThe USB receiver stores inside the mouse, and one AA battery lasts for months.",
    specs: [
      { label: "Connection", value: "2.4 GHz USB receiver" },
      { label: "DPI", value: "800 / 1200 / 1600" },
      { label: "Range", value: "10 m" },
      { label: "Warranty", value: "6 months" },
    ],
  },
  {
    id: "keyboard-mekanik",
    name: "Keyboard Mekanik",
    storeId: "gadget-mart",
    category: "Peripherals",
    price: 275000,
    image: "/images/keyboardmekanik.jpg",
    variants: ["Blue Switch", "Red Switch", "Brown Switch"],
    rating: 4.8,
    sold: 1800,
    ratingCount: 390,
    favorites: 220,
    stock: 60,
    tags: ["Backlit", "Local pick"],
    description:
      "A compact mechanical keyboard with a backlight and a sturdy frame.\n\nChoose the switch that fits you: Blue for a clicky feel, Red for smooth and quiet, Brown for a light tactile bump.",
    specs: [
      { label: "Layout", value: "87 keys (TKL)" },
      { label: "Switches", value: "Blue / Red / Brown" },
      { label: "Connection", value: "USB-C wired" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    id: "casing-hp-anti-crack",
    name: "Casing HP Anti Crack",
    storeId: "kreasi-case-id",
    category: "Phone Cases",
    price: 35000,
    originalPrice: 50000,
    image: "/images/casinghp.jpg",
    variants: ["Biru", "Hitam", "Bening"],
    sizeLabel: "Phone model",
    sizes: ["Samsung A15", "Redmi Note 13", "iPhone 13"],
    rating: 4.9,
    sold: 7400,
    ratingCount: 1500,
    favorites: 380,
    stock: 300,
    tags: ["Shockproof"],
    description:
      "A shockproof phone case with raised edges to protect the screen and camera.\n\nThe soft inner layer absorbs drops, and the buttons stay easy to press.",
    specs: [
      { label: "Material", value: "TPU + polycarbonate" },
      { label: "Protection", value: "Drop and scratch resistant" },
      { label: "Wireless charging", value: "Compatible" },
      { label: "Warranty", value: "None" },
    ],
  },
];

export const getStore = (id: string) => STORES.find((s) => s.id === id);
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const productsOfStore = (storeId: string) =>
  PRODUCTS.filter((p) => p.storeId === storeId);

export const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const discountPercent = (p: Product) =>
  p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

export const formatSold = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k sold` : `${n} sold`;
