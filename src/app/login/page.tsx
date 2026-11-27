
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, loginWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      router.replace("/");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };

      if (error.message === "EMAIL_NOT_VERIFIED") {
        setError("Email belum diverifikasi. Silakan verifikasi email terlebih dahulu.");
      } else {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            setError("Email atau password salah.");
            break;
          case "auth/invalid-email":
            setError("Format email tidak valid.");
            break;
          case "auth/too-many-requests":
            setError("Terlalu banyak percobaan. Coba lagi nanti.");
            break;
          default:
            setError("Login gagal. Silakan coba lagi.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      router.replace("/");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };

      if (error.message === "EMAIL_NOT_VERIFIED") {
        setError("Email Google belum terverifikasi.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Popup login ditutup sebelum proses selesai.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
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
      <div className="mx-auto" style={{ maxWidth: "450px" }}>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <h1 className="text-center mb-2">Login</h1>

            <p className="text-center text-secondary mb-4">
              Selamat datang kembali di Digeboy Shop
            </p>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>
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

              <div className="mb-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  disabled={loading}
                />
              </div>

              <div className="text-end mb-3">
                <Link href="/forgot-password">
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>

            <div className="text-center my-3 text-secondary">
              atau
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Login dengan Google
            </button>

            <p className="text-center mt-4 mb-0">
              Belum punya akun?{" "}
              <Link href="/register">Daftar</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
