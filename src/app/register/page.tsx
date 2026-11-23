"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import styles from "@/components/auth.module.css";
import { register, loginWithGoogle, authError } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeat) { setError("Kata sandi dan pengulangannya tidak sama."); return; }
    setBusy(true); setError("");
    try { await register(name.trim(), email, password); router.push("/products"); }
    catch (err) { setError(authError(err)); }
    finally { setBusy(false); }
  };

  const google = async () => {
    setBusy(true); setError("");
    try { await loginWithGoogle(); router.push("/products"); }
    catch (err) { setError(authError(err)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell
      title="Yuk, mulai belanja!"
      cardTitle="Daftar dengan email"
      footer={<>Sudah punya akun? <Link className={styles.link} href="/login">Masuk</Link></>}
    >
      {error && <p className={styles.error} role="alert">{error}</p>}
      <form onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="name">Nama lengkap</label>
          <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Kata sandi</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="repeat">Ulangi kata sandi</label>
          <input id="repeat" type="password" required autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
        </div>
        <button className={styles.primary} disabled={busy}>{busy ? "Memproses…" : "Daftar"}</button>
      </form>
      <div className={styles.divider}>atau</div>
      <button className={styles.google} disabled={busy} onClick={google}>
        <span style={{ fontWeight: 800, color: "#4285F4" }}>G</span> Lanjutkan dengan Google
      </button>
    </AuthShell>
  );
}
