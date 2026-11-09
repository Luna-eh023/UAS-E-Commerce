"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import styles from "./ChatPage.module.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "admin";
  time: string;
}

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Selamat datang di Digeboy E-commerce.",
      sender: "admin",
      time: "10:00",
    },
    {
      id: 2,
      text: "Ada yang bisa kami bantu hari ini?",
      sender: "admin",
      time: "10:00",
    },
  ]);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userText = inputMessage.trim();

    const newMessage: Message = {
      id: Date.now(),
      text: userText,
      sender: "user",
      time: now,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    const text = userText.toLowerCase();

    let reply =
      "Terima kasih telah menghubungi Digeboy E-commerce. Tim kami siap membantu Anda.";

    if (text.includes("harga")) {
      reply = "Untuk informasi harga, silakan cek katalog produk kami.";
    } else if (text.includes("pengiriman")) {
      reply = "Estimasi pengiriman biasanya 2-5 hari kerja.";
    } else if (text.includes("pesanan") || text.includes("order")) {
      reply = "Silakan berikan nomor pesanan Anda untuk pengecekan.";
    } else if (text.includes("halo") || text.includes("hai")) {
      reply = "Halo! Senang bisa membantu Anda.";
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: reply,
          sender: "admin",
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 800);
  };

  return (
    <main className={styles.chatPage}>

      {/* HEADER */}
      <header className={styles.topbar}>
        <Link href="/" className={styles.logo}>
          Digeboy<span>E-Commerce.</span>
        </Link>

        <Link href="/" className={styles.backButton}>
          ← Back to Shop
        </Link>
      </header>

      {/* CHAT CONTAINER */}
      <section className={styles.chatLayout}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Messages</h2>
            <p>Your customer support conversations</p>
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search conversations..."
            />
          </div>

          <div className={styles.conversation}>
            <div className={styles.avatar}>
              CS
              <span className={styles.onlineIndicator}></span>
            </div>

            <div className={styles.conversationInfo}>
              <h4>Customer Service</h4>
              <p>Welcome to STYLEHUB!</p>
            </div>

            <span className={styles.activeLabel}>Active</span>
          </div>
        </aside>

        {/* CHAT AREA */}
        <div className={styles.chatContent}>

          <div className={styles.chatHeader}>
            <div className={styles.avatar}>
              CS
              <span className={styles.onlineIndicator}></span>
            </div>

            <div>
              <h3>Customer Service</h3>
              <p>
                <span className={styles.greenDot}></span>
                Online - Ready to help
              </p>
            </div>
          </div>

          {/* MESSAGE AREA */}
          <div className={styles.messagesArea}>
            <div className={styles.dateDivider}>
              <span>Today</span>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender === "user"
                    ? styles.userMessageWrapper
                    : styles.adminMessageWrapper
                }
              >
                <div
                  className={
                    message.sender === "user"
                      ? styles.userMessage
                      : styles.adminMessage
                  }
                >
                  <p>{message.text}</p>
                  <span>{message.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* MESSAGE INPUT */}
          <form
            className={styles.messageForm}
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />

            <button type="submit">
              Send ➤
            </button>
          </form>

        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.pageFooter}>
        © 2026 Digeboy. All Rights Reserved.
      </footer>

    </main>
  );
}
