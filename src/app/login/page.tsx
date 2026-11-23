"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import styles from "@/components/auth.module.css";
import { login, loginWithGoogle, authError } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError("");
    try { await fn(); router.push("/products"); }
    catch (e) { setError(authError(e)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell
      title="Selamat datang kembali"
      cardTitle="Masuk ke Digeboy"
      footer={<>Belum punya akun? <Link className={styles.link} href="/register">Daftar</Link></>}
    >
      {error && <p className={styles.error} role="alert">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); run(() => login(email, password, remember)); }}>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Kata sandi</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className={styles.row}>
          <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Ingat saya</label>
          <Link className={styles.link} href="/forgot-password">Lupa kata sandi?</Link>
        </div>
        <button className={styles.primary} disabled={busy}>{busy ? "Memproses…" : "Masuk"}</button>
      </form>
      <div className={styles.divider}>atau</div>
      <button className={styles.google} disabled={busy} onClick={() => run(loginWithGoogle)}>
        <span style={{ fontWeight: 800, color: "#4285F4" }}>G</span> Lanjutkan dengan Google
      </button>
    </AuthShell>
  );
}
