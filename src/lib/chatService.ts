
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export async function sendMessage(
  chatId: string,
  senderId: string,
  senderRole: "user" | "seller",
  message: string
) {
  try {
    const chatRef = doc(db, "chat", chatId);
    const messagesRef = collection(chatRef, "messages");

    await addDoc(messagesRef, {
      senderId,
      senderRole,
      text: message,
      createdAt: serverTimestamp(),
    });

    await updateDoc(chatRef, {
      lastMessage: message,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Gagal mengirim pesan:", error);
    throw error;
  }
}

export async function getMessages(chatId: string) {
  try {
    const messagesRef = collection(
      db,
      "chat",
      chatId,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(messagesQuery);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  } catch (error) {
    console.error("Gagal mengambil pesan:", error);
    throw error;
  }
}
