"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import HelpModal from "@/components/HelpModal";
import {
  FaqItem,
  HelpType,
  getFaqs,
  getGreeting,
  seedFaqs,
} from "@/lib/faq";
import styles from "./faq.module.css";

const NAMA_PENGGUNA = "Charlie";

const TIPS = [
  "Meminta kode OTP, PIN, atau password dengan alasan apa pun.",
  "Mengajak bertransaksi atau transfer di luar aplikasi Digeboy.",
  "Mengirim tautan yang mencurigakan atau meminta kamu mengisi data pribadi.",
  "Menawarkan harga yang jauh lebih murah dari harga wajar dan mendesak kamu cepat membayar.",
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [helpMode, setHelpMode] = useState<HelpType | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [toastShow, setToastShow] = useState(false);

  useEffect(() => {
    let active = true;

    getFaqs()
      .then((data) => {
        if (active) setFaqs(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(
            "Gagal memuat FAQ. Periksa konfigurasi Firebase dan aturan Firestore."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSeed = async () => {
    try {
      await seedFaqs();
      setFaqs(await getFaqs());
    } catch (err) {
      console.error(err);
      setError("Gagal membuat data contoh.");
    }
  };

  const handleSent = () => {
    setHelpMode(null);
    setToastShow(true);
  };

  const query = keyword.trim().toLowerCase();
  const visible = faqs.filter(
    (f) =>
      query === "" ||
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query)
  );

  return (
    <main className="container py-4 pb-5">
      <section className="row align-items-center g-4 py-3">
        <div className="col-lg-7">
          <div className="text-muted fw-semibold mb-2">digeboy care</div>
          <h1 className="display-5 fw-bold mb-1">
            <span suppressHydrationWarning>{getGreeting()}</span>,{" "}
            <span style={{ color: "#03ac0e" }}>{NAMA_PENGGUNA}</span>
          </h1>
          <h2 className="display-6 fw-bold mb-4">Ada yang bisa kami bantu?</h2>

          <div className="input-group input-group-lg">
            <span className="input-group-text bg-body rounded-start-pill ps-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="form-control rounded-end-pill"
              placeholder="Ketik kata kunci (misal: refund pesanan)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Cari bantuan"
            />
          </div>
        </div>

        <div className="col-lg-5">
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.blob} />
            <div className={styles.mark}>d</div>
            <span className={`${styles.bubble} ${styles.bubbleOne}`}>?</span>
            <span className={`${styles.bubble} ${styles.bubbleTwo}`}>!</span>
            <span className={`${styles.bubble} ${styles.bubbleThree}`}>✓</span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5" style={{ maxWidth: 780 }}>
        <h2 className="h3 fw-bold text-center mb-4">Yang sering ditanyakan</h2>

        <div className="bg-body rounded-4 shadow-sm px-3 py-2">
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          )}

          {error && <div className="alert alert-danger my-3">{error}</div>}

          {!loading && !error && faqs.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">Belum ada FAQ.</p>
              <Button variant="primary" onClick={handleSeed}>
                Buat Data Contoh
              </Button>
            </div>
          )}

          {!loading && faqs.length > 0 && visible.length === 0 && (
            <p className="text-muted text-center py-4 mb-0">
              Tidak ada hasil untuk &quot;{keyword}&quot;. Coba kata kunci lain
              atau mulai chat dengan DIGI.
            </p>
          )}

          {visible.length > 0 && (
            <Accordion flush className={styles.faqAccordion}>
              {visible.map((f) => (
                <Accordion.Item key={f.id} eventKey={f.id}>
                  <Accordion.Header>{f.question}</Accordion.Header>
                  <Accordion.Body>
                    <p className="text-muted mb-2">{f.answer}</p>
                    {f.href && (
                      <Link
                        href={f.href}
                        className="fw-semibold text-decoration-none"
                      >
                        {f.hrefLabel}
                      </Link>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      <section className="mx-auto mt-5" style={{ maxWidth: 780 }}>
        <div className="bg-body rounded-4 shadow-sm p-4 d-flex flex-column flex-md-row gap-4 align-items-md-center">
          <div className={styles.reportIcon} aria-hidden="true">
            !
          </div>
          <div>
            <h2 className="h4 fw-bold">Laporkan tindak penipuan</h2>
            <p className="text-muted">
              Beri tahu kami jika kamu mengalami pembajakan akun,
              penyalahgunaan kartu kredit, atau menerima pesan mencurigakan.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setHelpMode("laporan")}>
                Laporkan
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowTips((prev) => !prev)}
              >
                Pelajari Ciri Pelaku
              </Button>
            </div>
            {showTips && (
              <ul className="mt-3 mb-0 text-muted">
                {TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="text-center mt-5 pt-3">
        <h2 className="h4 fw-bold">Layanan Pengaduan Konsumen</h2>
        <p className="mb-1">
          Direktorat Jenderal Perlindungan Konsumen dan Tertib Niaga
          <br />
          Kementerian Perdagangan Republik Indonesia
        </p>
        <p className="text-muted mb-0">
          WhatsApp Ditjen PKTN:{" "}
          <span className="fw-semibold" style={{ color: "#03ac0e" }}>
            0853 1111 1010
          </span>
        </p>
      </section>

      <footer className="text-muted small mt-5 pt-3">
        © 2026 Digeboy
      </footer>

      <div className={styles.chatFloat}>
        <div className={styles.chatAvatar}>D</div>
        <div className={styles.chatText}>
          <div className="fw-bold">Masih punya pertanyaan?</div>
          <div className="small">Mulai chat dengan DIGI, yuk</div>
        </div>
        <Button
          variant="outline-light"
          size="sm"
          className="fw-bold text-nowrap"
          onClick={() => setHelpMode("chat")}
        >
          Mulai Chat
        </Button>
      </div>

      <HelpModal
        mode={helpMode}
        onClose={() => setHelpMode(null)}
        onSent={handleSent}
      />

      <ToastContainer
        position="bottom-start"
        className="p-3"
        style={{ position: "fixed" }}
      >
        <Toast
          show={toastShow}
          onClose={() => setToastShow(false)}
          delay={3500}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white">
            Pesan terkirim. Tim Digeboy Care akan menghubungimu.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  );
}
