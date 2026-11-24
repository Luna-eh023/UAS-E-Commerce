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
          <h3>
            Test link: /chat, /lacak-barang, /search
          </h3>
        </div>
      </section>
    </main>
  );
}
