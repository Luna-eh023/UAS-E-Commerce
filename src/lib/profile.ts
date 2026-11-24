import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type UserProfile = {
  displayName: string;
  phone: string;
  address: string;
};

export async function getUserProfile(uid: string) {
  const profileRef = doc(db, "users", uid);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    displayName:
      typeof data.displayName === "string"
        ? data.displayName
        : "",
    phone:
      typeof data.phone === "string"
        ? data.phone
        : "",
    address:
      typeof data.address === "string"
        ? data.address
        : "",
  } as UserProfile;
}

export async function saveUserProfile(
  uid: string,
  profile: UserProfile
) {
  const profileRef = doc(db, "users", uid);

  await setDoc(
    profileRef,
    {
      displayName: profile.displayName.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}