
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  reload,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkVerification() {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("Silakan login terlebih dahulu.");
        return;
      }

      await reload(user);

      if (user.emailVerified) {
        router.replace("/");
      } else {
        setMessage(
          "Email belum terverifikasi. Silakan buka email verifikasi terlebih dahulu."
        );
      }
    } catch {
      setMessage("Gagal memeriksa status verifikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("Silakan login terlebih dahulu.");
        return;
      }

      await sendEmailVerification(user);
      setMessage("Email verifikasi berhasil dikirim ulang.");
    } catch {
      setMessage("Gagal mengirim email. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5 text-center">
            <h1 className="mb-3">Verifikasi Email</h1>

            <p className="text-secondary">
              Sebelum masuk ke Digeboy Shop, verifikasi email
              kamu melalui link yang dikirim ke email terdaftar.
            </p>

            {message && (
              <div className="alert alert-info mt-3">
                {message}
              </div>
            )}

            <button
              type="button"
              className="btn btn-success w-100 mt-3"
              onClick={checkVerification}
              disabled={loading}
            >
              {loading ? "Memeriksa..." : "Saya sudah verifikasi"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={resendVerification}
              disabled={loading}
            >
              Kirim ulang email verifikasi
            </button>

            <button
              type="button"
              className="btn btn-link mt-3"
              onClick={handleLogout}
              disabled={loading}
            >
              Keluar dan kembali ke login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
