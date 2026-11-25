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

  return credential.user;
}

// LOGIN EMAIL & PASSWORD
export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return credential.user;
}

// LOGIN GOOGLE
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

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