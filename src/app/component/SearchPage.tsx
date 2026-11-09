"use client";

import { useState } from "react";
import styles from "./SearchPage.module.css";

const products = [
  {
    id: 1,
    name: "Classic Sneakers",
    category: "Shoes",
    price: 459000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    id: 2,
    name: "Minimalist Watch",
    category: "Accessories",
    price: 329000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  },
  {
    id: 3,
    name: "Everyday Backpack",
    category: "Bags",
    price: 275000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
  },
  {
    id: 4,
    name: "Casual Shoes",
    category: "Shoes",
    price: 399000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
  },
  {
    id: 5,
    name: "Classic Handbag",
    category: "Bags",
    price: 350000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
  },
  {
    id: 6,
    name: "Fashion Sunglasses",
    category: "Accessories",
    price: 189000,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
  },
];

const categories = ["All", "Shoes", "Bags", "Accessories"];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
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
            placeholder="Search for products..."
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
              <div className={styles.productCard} key={product.id}>
                <img src={product.image} alt={product.name} />

                <div className={styles.productInfo}>
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>
                    Rp{product.price.toLocaleString("id-ID")}
                  </p>
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