
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  registerUser,
  loginWithGoogle,
} from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password);

      setSuccess(
        "Registrasi berhasil! Silakan cek email untuk verifikasi akun."
      );

      setTimeout(() => {
        router.push("/");
      }, 2500);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("Email sudah terdaftar.");
          break;
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;
        case "auth/weak-password":
          setError("Password terlalu lemah.");
          break;
        case "auth/operation-not-allowed":
          setError("Registrasi email/password belum diaktifkan.");
          break;
        default:
          setError("Registrasi gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      if (firebaseError.code === "auth/popup-closed-by-user") {
        setError("Popup login ditutup sebelum proses selesai.");
      } else if (
        firebaseError.code === "auth/account-exists-with-different-credential"
      ) {
        setError("Email sudah terdaftar dengan metode login berbeda.");
      } else {
        setError("Login Google gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-5">
      <div
        className="mx-auto"
        style={{ maxWidth: "450px" }}
      >
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <h1 className="text-center mb-2">
              Buat Akun
            </h1>

            <p className="text-center text-secondary mb-4">
              Bergabung dengan Digeboy Shop
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

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
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

              <div className="mb-3">
                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">
                  Konfirmasi Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Ulangi password"
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
                  ? "Memproses..."
                  : "Daftar"}
              </button>
            </form>

            <div className="text-center my-3 text-secondary">
              atau
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleGoogleRegister}
              disabled={loading}
            >
              Daftar dengan Google
            </button>

            <p className="text-center mt-4 mb-0">
              Sudah punya akun?{" "}
              <Link href="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
