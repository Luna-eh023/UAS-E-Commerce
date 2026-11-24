"use client";

import { useState } from "react";
import styles from "./SearchPage.module.css";

type Product = {
  id: number;
  name: string;
  category: string;
  image: string;
  sellerName: string;
  sellerImage: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Powerbank 10.000 mAh",
    category: "Elektronik",
    image: "/images/powerbank10000mah.webp",
    sellerName: "Seller 1",
    sellerImage: "/images/pppenjual1.jpg",
  },
  {
    id: 2,
    name: "Mouse Wireless Logitech",
    category: "Aksesoris",
    image: "/images/mousewireless.webp",
    sellerName: "Seller 3",
    sellerImage: "/images/pppenjual3.jpg",
  },
  {
    id: 3,
    name: "Keyboard Mekanik",
    category: "Aksesoris",
    image: "/images/keyboardmekanik.jpg",
    sellerName: "Seller 4",
    sellerImage: "/images/pppenjual4.jpg",
  },
  {
    id: 4,
    name: "Kabel USB",
    category: "Aksesoris",
    image: "/images/kabelusb.jpg",
    sellerName: "Seller 5",
    sellerImage: "/images/pppenjual5.jpg",
  },
  {
    id: 5,
    name: "Casing HP Transparan",
    category: "Aksesoris",
    image: "/images/casinghp.jpg",
    sellerName: "Seller 6",
    sellerImage: "/images/pppenjual6.jpg",
  },
  {
    id: 6,
    name: "TWS Wireless Earbuds",
    category: "Elektronik",
    image: "/images/tws.jpg",
    sellerName: "Seller 7",
    sellerImage: "/images/pppenjual7.jpg",
  },
];

const categories = ["All", "Elektronik", "Aksesoris"];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase();

    const nameMatch =
      product.name.toLowerCase().includes(keyword) ||
      product.sellerName.toLowerCase().includes(keyword);

    const categoryMatch = product.category
      .toLowerCase()
      .includes(keyword);

    const filterMatch =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return (nameMatch || categoryMatch) && filterMatch;
  });

  return (
    <div className={styles.searchPage}>
      <div className={styles.header}>
        <p>DIGEBOY E-COMMERCE</p>
        <h1>Find Your Style</h1>
        <span>Discover products that match your style.</span>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search for products or sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>
              Clear
            </button>
          )}
        </div>

        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? styles.activeCategory
                  : ""
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.resultHeader}>
          <h2>Products</h2>
          <p>{filteredProducts.length} products found</p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div
                className={styles.productCard}
                key={product.id}
              >
                <img
                  className={styles.productImage}
                  src={product.image}
                  alt={product.name}
                />

                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className={styles.sellerInfo}>
                    <img
                      className={styles.sellerAvatar}
                      src={product.sellerImage}
                      alt={`Foto profil ${product.sellerName}`}
                    />

                    <span>{product.sellerName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No products found</h3>
            <p>Try searching with another keyword.</p>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}