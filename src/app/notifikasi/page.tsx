
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import NotificationItem from "@/components/NotificationItem";
import {
  AppNotification,
  GROUP_ORDER,
  NotifType,
  getNotifications,
  groupLabel,
  markAllRead,
  markRead,
  seedNotifications,
} from "@/lib/notifications";

type Filter = "semua" | NotifType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pesanan", label: "Pesanan" },
  { key: "chat", label: "Chat" },
  { key: "promo", label: "Promo" },
];

export default function NotifikasiPage() {
  const router = useRouter();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [markingAll, setMarkingAll] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getNotifications()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((err) => {
        console.error(err);

        if (active) {
          setError(
            "Gagal memuat notifikasi. Periksa konfigurasi Firebase dan aturan Firestore."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refresh = async () => {
    const data = await getNotifications();
    setItems(data);
  };

  const handleSeed = async () => {
    if (seeding) return;

    setSeeding(true);
    setError("");

    try {
      await seedNotifications();
      await refresh();
    } catch (err) {
      console.error(err);
      setError("Gagal membuat data contoh.");
    } finally {
      setSeeding(false);
    }
  };

  const handleOpen = async (target: AppNotification) => {
    if (target.read || updatingId || markingAll) return;

    setUpdatingId(target.id);
    setError("");

    setItems((prev) =>
      prev.map((n) => (n.id === target.id ? { ...n, read: true } : n))
    );

    try {
      await markRead(target.id);
    } catch (err) {
      console.error(err);

      setItems((prev) =>
        prev.map((n) =>
          n.id === target.id ? { ...n, read: false } : n
        )
      );

      setError("Gagal menyimpan status notifikasi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadIds = items.filter((n) => !n.read).map((n) => n.id);

  const handleMarkAll = async () => {
    if (markingAll || unreadIds.length === 0) return;

    const previousItems = items;

    setMarkingAll(true);
    setError("");

    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllRead(unreadIds);
    } catch (err) {
      console.error(err);

      setItems(previousItems);
      setError("Gagal menandai semua notifikasi sebagai dibaca.");
    } finally {
      setMarkingAll(false);
    }
  };

  const visible = items.filter(
    (n) => filter === "semua" || n.type === filter
  );

  return (
    <main className="container py-4" style={{ maxWidth: 760 }}>
      <div className="bg-body rounded-4 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 className="h2 fw-bold mb-0">Notifikasi</h1>

            <div className="text-muted small">
              {unreadIds.length > 0
                ? `${unreadIds.length} belum dibaca`
                : "Semua sudah dibaca"}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {unreadIds.length > 0 && (
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill px-3"
                disabled={markingAll || !!updatingId}
                onClick={handleMarkAll}
              >
                {markingAll ? (
                  <>
                    <Spinner
                      size="sm"
                      animation="border"
                      className="me-2"
                    />
                    Menyimpan...
                  </>
                ) : (
                  "Tandai semua dibaca"
                )}
              </Button>
            )}

            <button
              type="button"
              className="btn-close"
              aria-label="Tutup"
              onClick={() => router.back()}
            />
          </div>
        </div>

        <div className="d-flex gap-2 flex-nowrap overflow-auto pb-2 mb-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "secondary" : "outline-secondary"}
              className="rounded-pill px-3 text-nowrap fw-semibold"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && items.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">Belum ada notifikasi.</p>

            <Button
              variant="primary"
              disabled={seeding}
              onClick={handleSeed}
            >
              {seeding ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Membuat data...
                </>
              ) : (
                "Buat Data Contoh"
              )}
            </Button>
          </div>
        )}

        {!loading && items.length > 0 && visible.length === 0 && (
          <p className="text-muted text-center py-4">
            Tidak ada notifikasi untuk filter ini.
          </p>
        )}

        {!loading &&
          items.length > 0 &&
          GROUP_ORDER.map((group) => {
            const rows = visible.filter(
              (n) => groupLabel(n.createdAt) === group
            );

            if (rows.length === 0) return null;

            return (
              <section key={group} className="mt-3">
                <h2 className="h5 fw-bold mb-2">{group}</h2>

                {rows.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onOpen={handleOpen}
                  />
                ))}
              </section>
            );
          })}
      </div>
    </main>
  );
}
