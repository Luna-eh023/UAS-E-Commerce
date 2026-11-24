import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header>
        <nav>
          <Link href="/">Digeboy E-Commerce</Link>

          <div>
            <Link href="/search">Search Produk</Link>
            <Link href="/lacak-barang">Lacak Barang</Link>
            <Link href="/chat">Chat</Link>
          </div>
        </nav>
      </header>

      <section>
        <h1>Welcome to Digeboy E-Commerce</h1>
        <p>Discover products and enjoy your shopping experience.</p>

        <div>
          <Link href="/search">Explore Products</Link>
          <Link href="/lacak-barang">Track Your Orders</Link>
          <Link href="/chat">Contact Store</Link>
        </div>
      </section>
    </main>
  );
}
