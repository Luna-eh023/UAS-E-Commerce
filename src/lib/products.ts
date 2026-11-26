
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  storeName: string;
  rating: number;
  reviewCount: number;
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Earphone Bluetooth TWS",
    category: "Audio",
    price: 149000,
    image: "/images/tws.jpg",
    description:
      "Earphone Bluetooth TWS ini dirancang untuk memberikan pengalaman mendengarkan audio yang praktis dan nyaman dalam aktivitas sehari-hari. Dengan desain tanpa kabel, pengguna dapat menikmati musik, melakukan panggilan telepon, maupun mendengarkan konten digital tanpa terganggu oleh kabel yang kusut. Produk ini cocok digunakan saat bekerja, belajar, berolahraga ringan, atau bepergian, sehingga menjadi pilihan aksesori audio yang praktis bagi pengguna smartphone maupun perangkat lain yang mendukung konektivitas Bluetooth.",
    storeName: "Digeboy Audio Store",
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 2,
    name: "Kabel USB-C 1m",
    category: "Aksesoris",
    price: 25000,
    image: "/images/kabelusb.jpg",
    description:
      "Kabel USB-C sepanjang 1 meter ini merupakan aksesori praktis yang digunakan untuk menghubungkan perangkat dengan port USB-C ke perangkat pengisi daya atau perangkat kompatibel lainnya. Panjang kabelnya memberikan fleksibilitas penggunaan saat mengisi daya smartphone, tablet, maupun perangkat elektronik lain yang mendukung koneksi USB-C. Dengan desain yang mudah dibawa dan digunakan, kabel ini cocok untuk kebutuhan penggunaan sehari-hari di rumah, kantor, maupun saat bepergian.",
    storeName: "Digeboy Accessories",
    rating: 4.6,
    reviewCount: 86,
  },
  {
    id: 3,
    name: "Mouse Wireless Slim",
    category: "Komputer",
    price: 85000,
    image: "/images/mousewireless.webp",
    description:
      "Mouse Wireless Slim hadir dengan desain minimalis dan bentuk yang praktis untuk menunjang aktivitas menggunakan komputer atau laptop. Koneksi wireless membantu pengguna bekerja tanpa perlu mengatur kabel tambahan, sehingga meja kerja terasa lebih rapi dan nyaman. Mouse ini dapat digunakan untuk kebutuhan produktivitas sehari-hari seperti browsing, mengerjakan tugas, mengolah dokumen, maupun aktivitas komputer lainnya, serta mudah dibawa ketika bepergian.",
    storeName: "Digeboy Computer",
    rating: 4.7,
    reviewCount: 97,
  },
  {
    id: 4,
    name: "Casing HP Anti Crack",
    category: "Aksesoris",
    price: 35000,
    image: "/images/casinghp.jpg",
    description:
      "Casing HP Anti Crack merupakan aksesori pelindung smartphone yang dirancang untuk membantu melindungi bagian luar perangkat dari goresan, benturan ringan, dan risiko kerusakan akibat penggunaan sehari-hari. Casing ini memberikan perlindungan tambahan pada bagian belakang serta sisi perangkat sekaligus mempertahankan kemudahan penggunaan berbagai tombol dan fitur smartphone. Produk ini cocok bagi pengguna yang ingin menjaga kondisi perangkat tetap baik sekaligus memberikan tampilan yang lebih menarik.",
    storeName: "Digeboy Accessories",
    rating: 4.5,
    reviewCount: 73,
  },
  {
    id: 5,
    name: "Power Bank 10000mAh",
    category: "Elektronik",
    price: 189000,
    image: "/images/powerbank10000mah.webp",
    description:
      "Power Bank 10000mAh ini dirancang sebagai sumber daya portabel yang membantu pengguna mengisi daya perangkat elektronik ketika tidak berada dekat dengan stopkontak. Kapasitasnya dapat digunakan sebagai daya tambahan untuk smartphone dan perangkat kompatibel lainnya selama aktivitas sehari-hari, perjalanan, maupun keadaan darurat. Dengan bentuk yang praktis untuk dibawa dalam tas, power bank ini menjadi pilihan bagi pengguna yang membutuhkan akses pengisian daya lebih fleksibel saat beraktivitas di luar rumah.",
    storeName: "Digeboy Gadget",
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: 6,
    name: "Keyboard Mekanik",
    category: "Komputer",
    price: 275000,
    image: "/images/keyboardmekanik.jpg",
    description:
      "Keyboard Mekanik dirancang untuk mendukung aktivitas mengetik, bekerja, belajar, dan bermain game dengan pengalaman penggunaan yang lebih responsif. Mekanisme tombol pada keyboard mekanik memberikan karakteristik pengetikan yang berbeda dibandingkan keyboard biasa, sehingga banyak digunakan oleh pengguna komputer yang membutuhkan kenyamanan dan konsistensi saat mengetik. Produk ini cocok digunakan untuk setup komputer pribadi, meja kerja, maupun kebutuhan gaming dan produktivitas sehari-hari.",
    storeName: "Digeboy Computer",
    rating: 4.8,
    reviewCount: 112,
  },
];
