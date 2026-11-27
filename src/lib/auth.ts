
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

// REGISTER
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await updateProfile(credential.user, {
    displayName: name.trim(),
  });

  await sendEmailVerification(credential.user);

  // Tetap login sementara untuk halaman verifikasi
  return credential.user;
}

// LOGIN EMAIL & PASSWORD
export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  return credential.user;
}

// LOGIN GOOGLE
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);

  if (!result.user.emailVerified) {
    await signOut(auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  return result.user;
}

// LOGOUT
export async function logoutUser() {
  await signOut(auth);
}

// RESET PASSWORD
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email.trim());
}
