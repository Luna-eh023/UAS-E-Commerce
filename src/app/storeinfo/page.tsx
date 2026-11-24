"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import ShopHeader from "../../components/ShopHeader";
import ProductCard from "../../components/ProductCard";
import { STORES, getStore, productsOfStore } from "../../lib/products";

type SortKey = "popular" | "low" | "high";

function StoreContent() {
  const params = useSearchParams();
  // Open another shop with /storeinfo?store=gadget-mart
  const store = getStore(params.get("store") ?? "") ?? STORES[0];

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState("home");
  const [sort, setSort] = useState<SortKey>("popular");
  const [following, setFollowing] = useState(false);

  const all = productsOfStore(store.id);
  const categories = Array.from(new Set(all.map((p) => p.category)));
  const tabs = [
    { id: "home", label: "Home" },
    { id: "all", label: "All Products" },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  let shown = all.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
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
      <ShopHeader query={query} onQueryChange={setQuery} />

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

export default function StoreInfoPage() {
  return (
    <Suspense fallback={null}>
      <StoreContent />
    </Suspense>
  );
}
