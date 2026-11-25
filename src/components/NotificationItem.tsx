"use client";

import Image from "next/image";
import Link from "next/link";
import Badge from "react-bootstrap/Badge";
import {
  AppNotification,
  TYPE_COLOR,
  TYPE_LABEL,
  relativeTime,
} from "@/lib/notifications";
import styles from "./NotificationItem.module.css";

const AVATAR_COLORS = [
  "#5c6bc0",
  "#26a69a",
  "#ef6c00",
  "#8d6e63",
  "#ab47bc",
  "#42a5f5",
  "#66bb6a",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1000003;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function Visual({ notification: n }: { notification: AppNotification }) {
  if (n.image) {
    return (
      <div className={styles.visual}>
        <Image
          src={n.image}
          alt={n.title}
          width={64}
          height={64}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  if (n.type === "chat") {
    return (
      <div
        className={styles.avatar}
        style={{ backgroundColor: avatarColor(n.title) }}
      >
        {n.title.charAt(0)}
      </div>
    );
  }

  if (n.type === "promo") {
    return (
      <div className={`${styles.visual} ${styles.tile} ${styles.sale}`}>
        SALE
      </div>
    );
  }

  return (
    <div className={`${styles.visual} ${styles.tile} ${styles.order}`}>
      ORDER
    </div>
  );
}

type NotificationItemProps = {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
};

export default function NotificationItem({
  notification,
  onOpen,
}: NotificationItemProps) {
  const n = notification;

  return (
    <div
      className={`d-flex align-items-center gap-3 py-3 px-2 rounded ${styles.row} ${
        n.read ? "" : styles.unread
      }`}
      onClick={() => onOpen(n)}
    >
      <span className={n.read ? styles.dotHidden : styles.dot} />

      <Visual notification={n} />

      <div className={`flex-grow-1 ${styles.text}`}>
        <div className="mb-1">
          <Badge bg={TYPE_COLOR[n.type]} className="me-2">
            {TYPE_LABEL[n.type]}
          </Badge>
          <span className="fw-bold">{n.title}</span>
        </div>
        <div className={n.read ? "text-muted" : ""}>{n.message}</div>
        <div className="text-muted small mt-1">{relativeTime(n.createdAt)}</div>
      </div>

      {n.href && (
        <Link
          href={n.href}
          className={`btn btn-outline-primary btn-sm rounded-pill ${styles.action}`}
        >
          {n.actionLabel}
        </Link>
      )}
    </div>
  );
}
