import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";

/** Lama chat disimpan di Firestore (hari). */
export const CHAT_RETENTION_DAYS = 7;

const VISITOR_KEY = "digeboy-visitor-id";

export type SenderRole = "user" | "seller";

export interface ChatMeta {
  storeId: string;
  storeName: string;
  sellerId: string;
  productId: string;
  productName: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: SenderRole;
  text: string;
  createdAt: Date;
}

/**
 * Tanggal kedaluwarsa = sekarang + 7 hari.
 * Field `expireAt` ini juga dipakai oleh Firestore TTL policy
 * untuk menghapus dokumen secara otomatis.
 */
function getExpireAt(): Timestamp {
  const ms = Date.now() + CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Timestamp.fromMillis(ms);
}

/**
 * ID pengunjung yang disimpan di browser (aplikasi belum memakai login).
 * Dipakai supaya setiap pengunjung punya percakapan sendiri di Firestore.
 */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }

    return id;
  } catch {
    // localStorage diblokir (mis. mode privat) -> ID sementara
    return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Satu dokumen di koleksi `chat` = satu pengunjung x satu toko. */
export function getChatId(visitorId: string, storeId: string): string {
  return `${visitorId}_${storeId}`;
}

/**
 * Simpan satu pesan ke chat/{chatId}/messages dan perbarui dokumen chat-nya
 * (lastMessage, updatedAt, expireAt) dalam satu batch.
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderRole: SenderRole,
  message: string,
  meta: ChatMeta,
  visitorId: string
) {
  try {
    const text = message.trim();
    if (!text) throw new Error("Pesan kosong");

    const chatRef = doc(db, "chat", chatId);
    const messageRef = doc(collection(chatRef, "messages"));
    const expireAt = getExpireAt();

    const chatSnapshot = await getDoc(chatRef);

    const batch = writeBatch(db);

    batch.set(messageRef, {
      senderId,
      senderRole,
      text,
      createdAt: serverTimestamp(),
      expireAt,
    });

    batch.set(
      chatRef,
      {
        userId: visitorId,
        storeId: meta.storeId,
        storeName: meta.storeName,
        sellerId: meta.sellerId,
        productId: meta.productId,
        productName: meta.productName,
        lastMessage: text,
        updatedAt: serverTimestamp(),
        expireAt,
        // createdAt hanya diisi saat chat pertama kali dibuat
        ...(chatSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );

    await batch.commit();

    return messageRef.id;
  } catch (error) {
    console.error("Gagal menyimpan pesan:", error);
    throw error;
  }
}

/**
 * Dengarkan pesan chat secara realtime. Hanya pesan yang belum kedaluwarsa
 * (maksimal 7 hari terakhir) yang ditampilkan.
 */
export function subscribeToMessages(
  chatId: string,
  onData: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const messagesQuery = query(
    collection(db, "chat", chatId, "messages"),
    where("expireAt", ">", Timestamp.now()),
    orderBy("expireAt", "asc")
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((document) => {
        // "estimate": pesan yang baru dikirim langsung punya waktu perkiraan
        const data = document.data({ serverTimestamps: "estimate" });
        const createdAt = data.createdAt as Timestamp | null | undefined;

        return {
          id: document.id,
          senderId: String(data.senderId ?? ""),
          senderRole: (data.senderRole === "seller"
            ? "seller"
            : "user") as SenderRole,
          text: String(data.text ?? ""),
          createdAt: createdAt ? createdAt.toDate() : new Date(),
        };
      });

      onData(messages);
    },
    (error) => {
      console.error("Gagal membaca pesan:", error);
      onError?.(error);
    }
  );
}
