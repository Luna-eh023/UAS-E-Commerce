// src/components/geboy/AccountProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { DEMO_USER_ID, ensureAccount, type UserAccount } from "../../lib/account";

interface Ctx {
  account: UserAccount | null;
  error: string | null;
}

const AccountContext = createContext<Ctx>({ account: null, error: null });

/** Use this in any /akun page: const { account, error } = useAccount(); */
export function useAccount() {
  return useContext(AccountContext);
}

export default function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    ensureAccount()
      .then(() => {
        if (cancelled) return;
        unsub = onSnapshot(
          doc(db, "users", DEMO_USER_ID),
          (snap) => {
            if (snap.exists()) setAccount(snap.data() as UserAccount);
          },
          (err) => setError(err.message)
        );
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return <AccountContext.Provider value={{ account, error }}>{children}</AccountContext.Provider>;
}
