import Link from "next/link";
import styles from "./not-found.module.css";

const SUGGESTIONS = [
  { href: "/orders", label: "Status Pesanan" },
  { href: "/notifikasi", label: "Notifikasi" },
  { href: "/faq", label: "FAQ" },
];

export default function NotFound() {
  return (
    <main className="container text-center py-5">
      <div className={styles.stage} aria-hidden="true">
        <span className={styles.digit}>4</span>
        <div className={styles.face}>
          <div className={`${styles.eye} ${styles.eyeLeft}`}>
            <div className={styles.pupil} />
          </div>
          <div className={`${styles.eye} ${styles.eyeRight}`}>
            <div className={styles.pupil} />
          </div>
          <div className={styles.tear} />
          <div className={styles.mouth} />
        </div>
        <span className={styles.digit}>4</span>
      </div>

      <h1 className="h2 fw-bold mt-4">Waduh, halaman tidak ditemukan</h1>
      <p className={`text-muted mx-auto ${styles.message}`}>
        Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        Periksa kembali alamatnya atau kembali ke halaman utama.
      </p>

      <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
        <Link href="/" className="btn btn-primary btn-lg px-4">
          Kembali ke Beranda
        </Link>
        <Link href="/faq" className="btn btn-outline-primary btn-lg px-4">
          Pusat Bantuan
        </Link>
      </div>

      <div className="mt-5">
        <div className="text-muted small mb-2">Mungkin kamu mencari:</div>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
