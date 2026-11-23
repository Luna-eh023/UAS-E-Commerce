"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { logout } from "@/lib/auth";

export default function AuthNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <div className="d-flex gap-2">
        <Link href="/login" className="btn btn-sm btn-outline-success fw-semibold">Masuk</Link>
        <Link href="/register" className="btn btn-sm btn-success fw-semibold">Daftar</Link>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="d-none d-md-inline small">
        Halo, <strong>{user.displayName || user.email}</strong>
      </span>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={async () => { await logout(); router.push("/login"); }}
      >
        Keluar
      </button>
    </div>
  );
}
