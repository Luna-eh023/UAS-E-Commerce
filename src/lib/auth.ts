import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail, sendEmailVerification, updateProfile,
  GoogleAuthProvider, signInWithPopup, setPersistence,
  browserLocalPersistence, browserSessionPersistence,
} from "firebase/auth";
import { auth } from "./firebase";

export async function register(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function login(email: string, password: string, remember: boolean) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function loginWithGoogle() {
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}

export const logout = () => signOut(auth);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

// Ubah kode error Firebase menjadi pesan yang mudah dipahami
export function authError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "Format email tidak valid.",
    "auth/missing-password": "Kata sandi belum diisi.",
    "auth/invalid-credential": "Email atau kata sandi salah.",
    "auth/user-not-found": "Akun dengan email ini tidak ditemukan.",
    "auth/wrong-password": "Email atau kata sandi salah.",
    "auth/email-already-in-use": "Email ini sudah terdaftar. Silakan masuk.",
    "auth/weak-password": "Kata sandi minimal 6 karakter.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
    "auth/popup-closed-by-user": "Jendela Google ditutup sebelum selesai.",
    "auth/network-request-failed": "Koneksi bermasalah. Periksa internet kamu.",
    "auth/operation-not-allowed": "Metode masuk ini belum diaktifkan di Firebase.",
  };
  return map[code] ?? "Terjadi kesalahan. Silakan coba lagi.";
}
