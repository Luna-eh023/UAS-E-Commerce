"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUnreadCount } from "@/lib/notifications";
import styles from "./NotificationBell.module.css";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = () => {
      getUnreadCount()
        .then((total) => {
          if (active) setCount(total);
        })
        .catch((err) => console.error(err));
    };

    load();
    window.addEventListener("focus", load);

    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, []);

  return (
    <Link
      href="/notifikasi"
      className="btn btn-primary rounded-pill px-3 position-relative"
    >
      Notifikasi
      {count > 0 && (
        <span key={count} className={styles.badge}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
