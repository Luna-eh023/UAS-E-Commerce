// src/app/akun/profil/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAccount } from "../../components/geboy/AccountProvider";
import { updateProfile, type Gender } from "../../lib/account";

const GENDERS: Gender[] = ["Laki-laki", "Perempuan", "Lainnya"];

// Shrinks the photo to 160x160 so it is small enough to store in Firestore (no Storage needed).
function resizeImage(file: File, size = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
    img.src = url;
  });
}

export default function ProfilePage() {
  const { account, error } = useAccount();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    gender: "Perempuan" as Gender,
    photoURL: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // copy Firestore data into the form once
  useEffect(() => {
    if (account && !loaded) {
      setForm({
        name: account.name,
        email: account.email,
        phone: account.phone,
        storeName: account.storeName,
        gender: account.gender,
        photoURL: account.photoURL,
      });
      setLoaded(true);
    }
  }, [account, loaded]);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      set("photoURL", await resizeImage(file));
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  async function onSave() {
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile(form);
      setMsg({ ok: true, text: "Profil tersimpan." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="gb-title">Profil</h1>
      {error && <div className="gb-error">Gagal terhubung ke Firestore: {error}</div>}
      {!account && !error && <p className="gb-muted">Memuat...</p>}

      {account && (
        <div className="gb-card gb-profile">
          <div className="gb-avatar-col">
            {form.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photoURL} alt="Foto profil" className="gb-avatar" />
            ) : (
              <div className="gb-avatar">{form.name.charAt(0).toUpperCase()}</div>
            )}
            <label className="gb-btn-outline">
              Pilih Gambar
              <input type="file" accept="image/png,image/jpeg" hidden onChange={onPickPhoto} />
            </label>
            <span className="gb-muted">Format JPG / PNG</span>
          </div>

          <div>
            <div className="gb-form-row">
              <label>Username</label>
              <input className="gb-input" value={account.username} readOnly />
            </div>
            <div className="gb-form-row">
              <label>Nama</label>
              <input className="gb-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="gb-form-row">
              <label>Email</label>
              <input className="gb-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="gb-form-row">
              <label>Nomor Telepon</label>
              <input className="gb-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="gb-form-row">
              <label>Nama Toko</label>
              <input className="gb-input" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
            </div>
            <div className="gb-form-row">
              <label>Jenis Kelamin</label>
              <div className="gb-radios">
                {GENDERS.map((g) => (
                  <label key={g}>
                    <input type="radio" name="gender" checked={form.gender === g} onChange={() => set("gender", g)} /> {g}
                  </label>
                ))}
              </div>
            </div>
            <div className="gb-form-row">
              <span />
              <div>
                <button className="gb-btn" onClick={onSave} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                {msg && (
                  <span className={msg.ok ? "gb-ok" : "gb-error"} style={{ marginLeft: 14 }}>
                    {msg.text}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
