"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchPage.module.css";
import {
  PRODUCT_RETENTION_DAYS,
  seedSearchProductsIfMissing,
  subscribeToProducts,
  type ProductRecord,
} from "../../lib/productService";

export default function SearchPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const seededRef = useRef(false);

  // Produk dibaca realtime dari Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setErrorMessage("");

        // Simpan produk bawaan yang belum ada (sekali per kunjungan halaman)
        if (!seededRef.current) {
          seededRef.current = true;
          seedSearchProductsIfMissing(
            new Set(data.map((product) => product.id))
          ).catch(() => {
            setErrorMessage(
              "Gagal menyimpan produk ke database. Periksa Firestore Rules."
            );
          });
        }
      },
      () => {
        setLoading(false);
        setErrorMessage(
          "Gagal terhubung ke database produk. Periksa koneksi internet dan Firestore Rules."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category))).sort(),
  ];

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase();

    const nameMatch =
      product.name.toLowerCase().includes(keyword) ||
      product.sellerName.toLowerCase().includes(keyword);

    const categoryMatch = product.category.toLowerCase().includes(keyword);

    const filterMatch =
      selectedCategory === "All" || product.category === selectedCategory;

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

        {errorMessage && (
          <div className={styles.errorBanner}>{errorMessage}</div>
        )}

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
          <p>
            {loading
              ? "Loading..."
              : `${filteredProducts.length} products found`}
          </p>
        </div>

        <p className={styles.retentionNote}>
          Produk dari halaman ini disimpan {PRODUCT_RETENTION_DAYS} hari,
          setelah itu terhapus otomatis.
        </p>

        {loading ? null : filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div
                className={styles.productCard}
                key={product.id}
              >
                {product.image ? (
                  <img
                    className={styles.productImage}
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <div className={styles.productEmoji}>
                    {product.emoji || "🛍️"}
                  </div>
                )}

                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  {product.price !== null && (
                    <p className={styles.productPrice}>
                      Rp{product.price.toLocaleString("id-ID")}
                    </p>
                  )}

                  {(product.rating !== null || product.sold !== null) && (
                    <p className={styles.productMeta}>
                      {product.rating !== null && `★ ${product.rating}`}
                      {product.rating !== null && product.sold !== null && " · "}
                      {product.sold !== null &&
                        `${product.sold.toLocaleString("id-ID")} terjual`}
                    </p>
                  )}

                  {product.sellerName ? (
                    <div className={styles.sellerInfo}>
                      {product.sellerImage && (
                        <img
                          className={styles.sellerAvatar}
                          src={product.sellerImage}
                          alt={`Foto profil ${product.sellerName}`}
                        />
                      )}

                      <span>{product.sellerName}</span>
                    </div>
                  ) : (
                    product.location && (
                      <div className={styles.sellerInfo}>
                        <span>📍 {product.location}</span>
                      </div>
                    )
                  )}
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