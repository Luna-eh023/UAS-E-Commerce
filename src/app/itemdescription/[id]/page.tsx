"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "../../../components/shop.css";
import DigeboyHeader from "../../../components/DigeboyHeader";
import ProductImage from "../../../components/ProductImage";
import ProductCard from "../../../components/ProductCard";
import { addToCart } from "../../../lib/cart";
import { fetchProduct, fetchProductsOfStore, fetchStore } from "../../../lib/catalog";
import {
  discountPercent,
  formatSold,
  rupiah,
  type Product,
  type Store,
} from "../../../lib/products";

// Placeholder texts. Change them to match your real shipping and return rules.
const SHIPPING_NOTE = "Estimated arrival in 2–4 days";
const GUARANTEE_NOTE = "Free return · COD · Damage protection";

function ItemView({ product, store, more }: { product: Product; store: Store; more: Product[] }) {
  const router = useRouter();
  const images = product.images?.length ? product.images : [product.image];

  const [variant, setVariant] = useState(product.variants[0]);
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [fav, setFav] = useState(false);
  const [notice, setNotice] = useState("");

  const chosen = size ? `${variant} / ${size}` : variant;
  const off = discountPercent(product);

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function handleAddToCart() {
    const ok = addToCart(
      {
        productId: product.id,
        storeName: store.name,
        name: product.name,
        variant: chosen,
        price: product.price,
        qty,
      },
      product.stock
    );
    flash(ok ? "Added to cart" : "Couldn't save to the cart");
  }

  function buyNow() {
    try {
      // The checkout page reads this to show the right order
      sessionStorage.setItem(
        "checkout",
        JSON.stringify({
          storeName: store.name,
          items: [{ name: product.name, variant: chosen, price: product.price, qty }],
        })
      );
    } catch {
      // storage unavailable: checkout falls back to its demo item
    }
    router.push("/checkout");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Link copied");
    } catch {
      flash("Couldn't copy the link");
    }
  }

  const stars = Math.round(product.rating);

  return (
    <div className="sh-page">
      <main className="sh-wrap sh-section">
        <nav className="sh-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href={`/storeinfo?store=${store.id}`}>{store.name}</Link>
          <span>›</span>
          <span>{product.category}</span>
          <span>›</span>
          <span className="sh-crumbs__current">{product.name}</span>
        </nav>

        <section className="sh-box sh-item">
          {/* left: images */}
          <div className="sh-gallery">
            <ProductImage
              key={imgIndex}
              src={images[imgIndex]}
              alt={product.name}
              className="sh-item__img"
            />

            <div className="sh-thumbs">
              {images.length > 1 && (
                <button
                  type="button"
                  className="sh-thumbs__arrow"
                  aria-label="Previous image"
                  onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                >
                  ‹
                </button>
              )}
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  className={`sh-thumb ${i === imgIndex ? "is-active" : ""}`}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setImgIndex(i)}
                >
                  <ProductImage src={src} alt={`${product.name} ${i + 1}`} className="sh-thumb__img" />
                </button>
              ))}
              {images.length > 1 && (
                <button
                  type="button"
                  className="sh-thumbs__arrow"
                  aria-label="Next image"
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                >
                  ›
                </button>
              )}
            </div>

            <div className="sh-gallery__actions">
              <button type="button" className="sh-textbtn" onClick={copyLink}>
                Share: copy link
              </button>
              <button
                type="button"
                className={`sh-textbtn ${fav ? "is-on" : ""}`}
                aria-pressed={fav}
                onClick={() => setFav((f) => !f)}
              >
                {fav ? "♥" : "♡"} Favorite ({product.favorites + (fav ? 1 : 0)})
              </button>
            </div>
          </div>

          {/* right: details */}
          <div className="sh-item__info">
            <h1 className="sh-item__title">{product.name}</h1>

            <div className="sh-ratingrow">
              <span className="sh-ratingnum">{product.rating.toFixed(1)}</span>
              <span className="sh-stars" aria-label={`${product.rating} out of 5 stars`}>
                {"★".repeat(stars)}
                {"☆".repeat(5 - stars)}
              </span>
              <span className="sh-divider" />
              <span>{product.ratingCount} Ratings</span>
              <span className="sh-divider" />
              <span>{formatSold(product.sold)}</span>
            </div>

            <div className="sh-pricebox">
              {product.originalPrice && (
                <span className="sh-pricebox__old">{rupiah(product.originalPrice)}</span>
              )}
              <span className="sh-pricebox__now">{rupiah(product.price)}</span>
              {off > 0 && <span className="sh-pill sh-pill--solid">-{off}%</span>}
            </div>

            <div className="sh-opt">
              <span className="sh-opt__label">Shipping</span>
              <div className="sh-opt__body">{SHIPPING_NOTE}</div>
            </div>

            <div className="sh-opt">
              <span className="sh-opt__label">Guarantee</span>
              <div className="sh-opt__body">{GUARANTEE_NOTE}</div>
            </div>

            <div className="sh-opt">
              <span className="sh-opt__label">Variant</span>
              <div className="sh-opt__body">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`sh-chip ${variant === v ? "is-selected" : ""}`}
                    aria-pressed={variant === v}
                    onClick={() => setVariant(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {product.sizes && (
              <div className="sh-opt">
                <span className="sh-opt__label">{product.sizeLabel ?? "Size"}</span>
                <div className="sh-opt__body">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`sh-chip ${size === s ? "is-selected" : ""}`}
                      aria-pressed={size === s}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="sh-opt">
              <span className="sh-opt__label">Quantity</span>
              <div className="sh-opt__body">
                <div className="sh-qty">
                  <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <span className="sh-stock">{product.stock} in stock</span>
              </div>
            </div>

            <div className="sh-actions">
              <button type="button" className="sh-cartbtn" onClick={handleAddToCart}>
                Add To Cart
              </button>
              <button type="button" className="sh-buy" onClick={buyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </section>

        <section className="sh-box sh-store">
          <span className="sh-avatar">{store.name.charAt(0)}</span>
          <div className="sh-store__id">
            <strong>{store.name}</strong>
            <span>{store.activeText}</span>
            <Link href={`/storeinfo?store=${store.id}`} className="sh-link">View shop</Link>
          </div>
          <dl className="sh-store__stats">
            <div><dt>Rating</dt><dd>{store.rating}</dd></div>
            <div><dt>Followers</dt><dd>{store.followers}</dd></div>
            <div><dt>Joined</dt><dd>{store.joined}</dd></div>
          </dl>
        </section>

        <section className="sh-box">
          <h2 className="sh-box__title">Product specifications</h2>
          <dl className="sh-specs">
            <div><dt>Category</dt><dd>{product.category}</dd></div>
            {product.specs.map((s) => (
              <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
            ))}
          </dl>
        </section>

        <section className="sh-box">
          <h2 className="sh-box__title">Product description</h2>
          <div className="sh-desc">
            {product.description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {more.length > 0 && (
          <section>
            <h2 className="sh-heading">More from this shop</h2>
            <div className="sh-grid">
              {more.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {notice && (
        <p className="sh-toast" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

const fallbackStore = (id: string): Store => ({
  id,
  name: id,
  activeText: "",
  followers: "-",
  following: 0,
  rating: 0,
  ratingCount: "-",
  joined: "-",
  chatPerformance: "-",
});

type LoadState =
  | { status: "loading" | "missing" | "error" }
  | { status: "ready"; product: Product; store: Store; more: Product[] };

function ItemLoader({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const product = await fetchProduct(id);
        if (!product) {
          if (!cancelled) setState({ status: "missing" });
          return;
        }
        const [store, siblings] = await Promise.all([
          fetchStore(product.storeId),
          fetchProductsOfStore(product.storeId),
        ]);
        if (!cancelled) {
          setState({
            status: "ready",
            product,
            store: store ?? fallbackStore(product.storeId),
            more: siblings.filter((p) => p.id !== product.id).slice(0, 5),
          });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "ready") {
    return <ItemView product={state.product} store={state.store} more={state.more} />;
  }

  return (
    <div className="sh-page">
      <main className="sh-wrap sh-section">
        <div className="sh-box sh-empty">
          {state.status === "loading" && <p>Loading product...</p>}
          {state.status === "missing" && (
            <>
              <p>This product doesn&apos;t exist.</p>
              <Link href="/storeinfo" className="sh-link">Back to the shop</Link>
            </>
          )}
          {state.status === "error" && (
            <p>Couldn&apos;t load the product. Check your Firebase config and Firestore rules.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ItemDescriptionPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  // key resets the page (loading, choices) when you open another product
  return (
    <>
      <DigeboyHeader />
      <ItemLoader key={id} id={id} />
    </>
  );
}
