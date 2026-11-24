"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(
        "Email reset password berhasil dikirim. Silakan cek inbox email kamu."
      );
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      switch (firebaseError.code) {
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;
        case "auth/user-not-found":
          setError("Email tidak ditemukan.");
          break;
        case "auth/too-many-requests":
          setError("Terlalu banyak percobaan. Coba lagi nanti.");
          break;
        default:
          setError("Gagal mengirim email reset password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: "450px" }}>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <h1 className="text-center mb-2">
              Lupa Password
            </h1>

            <p className="text-center text-secondary mb-4">
              Masukkan email akun kamu untuk menerima link reset password.
            </p>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={handleReset}>
              <div className="mb-4">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading
                  ? "Mengirim..."
                  : "Kirim Reset Password"}
              </button>
            </form>

            <div className="text-center mt-4">
              <Link href="/login">
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}