export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Earphone Bluetooth TWS",
    category: "Audio",
    price: 149000,
    image: "/images/tws.jpg",
    description: "Earphone Bluetooth untuk aktivitas sehari-hari.",
  },
  {
    id: 2,
    name: "Kabel USB-C 1m",
    category: "Aksesoris",
    price: 25000,
    image: "/images/kabelusb.jpg",
    description: "Kabel USB-C praktis untuk perangkat kompatibel.",
  },
  {
    id: 3,
    name: "Mouse Wireless Slim",
    category: "Komputer",
    price: 85000,
    image: "/images/mousewireless.webp",
    description: "Mouse wireless dengan desain minimalis.",
  },
  {
    id: 4,
    name: "Casing HP Anti Crack",
    category: "Aksesoris",
    price: 35000,
    image: "/images/casinghp.jpg",
    description: "Casing pelindung untuk smartphone.",
  },
  {
    id: 5,
    name: "Power Bank 10000mAh",
    category: "Elektronik",
    price: 189000,
    image: "/images/powerbank10000mah.webp",
    description: "Power bank untuk kebutuhan pengisian daya.",
  },
  {
    id: 6,
    name: "Keyboard Mekanik",
    category: "Komputer",
    price: 275000,
    image: "/images/keyboardmekanik.jpg",
    description: "Keyboard mekanik untuk produktivitas dan gaming.",
  },
];