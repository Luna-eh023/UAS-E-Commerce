"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import styles from "@/components/auth.module.css";
import { resetPassword, authError } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setSent(false);
    try { await resetPassword(email); setSent(true); }
    catch (err) { setError(authError(err)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell
      title="Lupa kata sandi?"
      cardTitle="Atur ulang kata sandi"
      footer={<Link className={styles.link} href="/login">Kembali ke halaman masuk</Link>}
    >
      <p className={styles.hint}>Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru.</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {sent && <p className={styles.success}>Tautan sudah dikirim ke {email}. Cek kotak masuk atau folder spam.</p>}
      <form onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className={styles.primary} disabled={busy}>{busy ? "Mengirim…" : "Kirim tautan"}</button>
      </form>
    </AuthShell>
  );
}
