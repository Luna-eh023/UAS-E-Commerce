"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../../components/shop.css";
import DigeboyHeader from "../../components/DigeboyHeader";
import ProductCard from "../../components/ProductCard";
import { fetchProductsOfStore, fetchStores } from "../../lib/catalog";
import type { Product, Store } from "../../lib/products";

type SortKey = "popular" | "low" | "high";

function StoreView({ store, all }: { store: Store; all: Product[] }) {
  const [tab, setTab] = useState("home");
  const [sort, setSort] = useState<SortKey>("popular");
  const [following, setFollowing] = useState(false);

  const categories = Array.from(new Set(all.map((p) => p.category)));
  const tabs = [
    { id: "home", label: "Home" },
    { id: "all", label: "All Products" },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  let shown = all;
  if (tab !== "home" && tab !== "all") shown = shown.filter((p) => p.category === tab);
  shown = [...shown].sort((a, b) =>
    tab === "home" || sort === "popular"
      ? b.sold - a.sold
      : sort === "low"
      ? a.price - b.price
      : b.price - a.price
  );

  return (
    <div className="sh-page">
      <section className="sh-storehead">
        <div className="sh-wrap">
          <div className="sh-storehead__top">
            <div className="sh-storecard">
              <div className="sh-storecard__id">
                <span className="sh-avatar">{store.name.charAt(0)}</span>
                <div>
                  <h1 className="sh-storecard__name">{store.name}</h1>
                  <span className="sh-storecard__active">{store.activeText}</span>
                </div>
              </div>
              <div className="sh-storecard__btns">
                <button
                  type="button"
                  className="sh-outline-btn"
                  onClick={() => setFollowing((f) => !f)}
                >
                  {following ? "✓ Following" : "+ Follow"}
                </button>
                <button
                  type="button"
                  className="sh-outline-btn"
                  disabled
                  title="Chat is not available yet"
                >
                  Chat
                </button>
              </div>
            </div>

            <dl className="sh-stats">
              <div>Products: <b>{all.length}</b></div>
              <div>Followers: <b>{store.followers}</b></div>
              <div>Following: <b>{store.following}</b></div>
              <div>Rating: <b>{store.rating} ({store.ratingCount} Rating)</b></div>
              <div>Chat Performance: <b>{store.chatPerformance}</b></div>
              <div>Joined: <b>{store.joined}</b></div>
            </dl>
          </div>

          <div className="sh-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`sh-tab ${tab === t.id ? "is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="sh-wrap sh-section">
        <div className="sh-section__head">
          <h2 className="sh-heading">
            {tab === "home" ? "Recommended for you" : `${shown.length} products`}
          </h2>
          {tab !== "home" && (
            <label className="sh-sort">
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="popular">Popular</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          )}
        </div>

        {shown.length === 0 ? (
          <p className="sh-empty">No products found.</p>
        ) : (
          <div className="sh-grid">
            {shown.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

type Status = "loading" | "ready" | "empty" | "error";

function StoreLoader() {
  const params = useSearchParams();
  const wanted = params.get("store"); // /storeinfo?store=gadget-mart
  const [data, setData] = useState<{ store: Store; products: Product[] } | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const stores = await fetchStores();
        const store =
          stores.find((s) => s.id === wanted) ??
          stores.find((s) => s.id === "techzone-official") ??
          stores[0];
        if (!store) {
          if (!cancelled) setStatus("empty");
          return;
        }
        const products = await fetchProductsOfStore(store.id);
        if (!cancelled) {
          setData({ store, products });
          setStatus("ready");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wanted]);

  if (status === "ready" && data) {
    return <StoreView key={data.store.id} store={data.store} all={data.products} />;
  }

  return (
    <div className="sh-page">
      <main className="sh-wrap sh-section">
        <div className="sh-box sh-empty">
          {status === "loading" && <p>Loading shop...</p>}
          {status === "empty" && <p>No shops found. Add the data first on the /seed page.</p>}
          {status === "error" && (
            <p>Couldn&apos;t load the shop. Check your Firebase config and Firestore rules.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StoreInfoPage() {
  return (
    <>
      <DigeboyHeader />
      <Suspense fallback={null}>
        <StoreLoader />
      </Suspense>
    </>
  );
}
