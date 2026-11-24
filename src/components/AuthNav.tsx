
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { logoutUser } from "@/lib/auth";

export default function AuthNav() {
  const { user, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setLogoutLoading(true);

    try {
      await logoutUser();
    } catch {
      setError("Gagal logout. Silakan coba lagi.");
    } finally {
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return (
      <span className="text-muted small">
        Memuat akun...
      </span>
    );
  }

  if (!user) {
    return (
      <div className="d-flex align-items-center gap-2 flex-nowrap">
        <Link
          href="/login"
          className="btn btn-outline-primary btn-sm text-nowrap"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="btn btn-primary btn-sm text-nowrap"
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-nowrap">
      <Link
        href="/akun"
        className="btn btn-outline-primary btn-sm text-nowrap"
      >
        Akun Saya
      </Link>

      <button
        type="button"
        className="btn btn-outline-danger btn-sm text-nowrap"
        onClick={handleLogout}
        disabled={logoutLoading}
      >
        {logoutLoading ? "Keluar..." : "Logout"}
      </button>

      {error && (
        <span className="text-danger small">
          {error}
        </span>
      )}
    </div>
  );
}
