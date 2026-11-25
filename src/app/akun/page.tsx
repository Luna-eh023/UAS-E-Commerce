"use client";

import { useEffect, useState, type FormEvent } from "react";
import { updateProfile } from "firebase/auth";
import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";
import { getUserProfile, saveUserProfile } from "@/lib/profile";

export default function AkunPage() {
  const { user, loading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        setDisplayName(profile?.displayName || user.displayName || "");
        setPhone(profile?.phone || "");
        setAddress(profile?.address || "");
      } catch {
        setError("Gagal memuat profil pengguna.");
      } finally {
        setLoadingProfile(false);
      }
    }

    if (!loading) {
      loadProfile();
    }
  }, [user, loading]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const trimmedName = displayName.trim();

      if (!trimmedName) {
        setError("Nama tidak boleh kosong.");
        return;
      }

      await saveUserProfile(user.uid, {
        displayName: trimmedName,
        phone: phone.trim(),
        address: address.trim(),
      });

      await updateProfile(user, {
        displayName: trimmedName,
      });

      setDisplayName(trimmedName);
      setSuccess("Profil berhasil diperbarui.");
    } catch {
      setError("Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || loadingProfile) {
    return (
      <main className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="text-muted mt-3">Memuat profil...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container py-5">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: 500 }}>
          <div className="card-body text-center p-4">
            <h2 className="h4 mb-3">Anda belum login</h2>

            <p className="text-muted">
              Silakan login terlebih dahulu untuk melihat profil Anda.
            </p>

            <Link href="/login" className="btn btn-primary">
              Login Sekarang
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const avatarName = displayName || user.email || "User";
  const avatarLetter = avatarName.charAt(0).toUpperCase();

  return (
    <main className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7">
          <div className="mb-4">
            <h1 className="h3 fw-bold mb-1">Profil Saya</h1>

            <p className="text-muted mb-0">
              Kelola informasi akun dan data pribadi Anda.
            </p>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: 72,
                    height: 72,
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Foto profil"
                      className="rounded-circle w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    avatarLetter
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="h5 fw-bold mb-1">
                    {displayName || "Pengguna"}
                  </h2>

                  <p className="text-muted mb-0 text-break">
                    {user.email}
                  </p>

                  <span className="badge bg-success-subtle text-success mt-2">
                    Akun aktif
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-4">
                Informasi Pengguna
              </h2>

              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label htmlFor="displayName" className="form-label">
                    Nama Lengkap
                  </label>

                  <input
                    id="displayName"
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={user.email || ""}
                    disabled
                  />

                  <small className="text-muted">
                    Email berasal dari akun Firebase Authentication.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Nomor Telepon
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="form-label">
                    Alamat
                  </label>

                  <textarea
                    id="address"
                    className="form-control"
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap Anda"
                  />
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan Profil"}
                  </button>

                  <Link
                    href="/orders"
                    className="btn btn-outline-secondary"
                  >
                    Pesanan Saya
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}