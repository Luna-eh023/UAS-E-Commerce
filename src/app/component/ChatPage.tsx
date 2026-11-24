
"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
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

  const [isTyping, setIsTyping] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("digeboy-chat");

    if (savedMessages) {
      try {
        const parsedMessages: Message[] = JSON.parse(savedMessages);

        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      } catch {
        localStorage.removeItem("digeboy-chat");
      }
    }

    setChatLoaded(true);
  }, []);

  useEffect(() => {
    if (chatLoaded) {
      localStorage.setItem(
        "digeboy-chat",
        JSON.stringify(messages)
      );
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, chatLoaded]);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userText = inputMessage.trim();

    if (!userText || isTyping) return;

    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: Message = {
      id: Date.now(),
      text: userText,
      sender: "user",
      time: now,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    const text = userText.toLowerCase();

    let reply =
      "Terima kasih sudah menghubungi Digeboy E-commerce. Ada hal lain yang bisa kami bantu?";

    if (text.includes("harga")) {
      reply = "Untuk informasi harga, silakan cek katalog produk kami.";
    } else if (
      text.includes("pengiriman") ||
      text.includes("lacak")
    ) {
      reply = "Untuk mengecek pengiriman, silakan buka menu Lacak Pesanan. Kamu bisa mencoba nomor DGB001.";
    } else if (
      text.includes("pesanan") ||
      text.includes("order")
    ) {
      reply = "Silakan berikan nomor pesanan kamu agar bisa kami bantu cek.";
    } else if (
      text.includes("halo") ||
      text.includes("hai")
    ) {
      reply = "Halo! Senang bisa membantu kamu. Ada yang ingin ditanyakan?";
    } else if (text.includes("terima kasih")) {
      reply = "Sama-sama! Terima kasih sudah berbelanja di Digeboy.";
    }

    window.setTimeout(() => {
      const adminMessage: Message = {
        id: Date.now() + 1,
        text: reply,
        sender: "admin",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, adminMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <main className={styles.chatPage} id="chat">

      <header className={styles.topbar}>
        <Link href="/" className={styles.logo}>
          Digeboy<span>E-Commerce.</span>
        </Link>

        <Link href="/" className={styles.backButton}>
          ← Back to Shop
        </Link>
      </header>


      <section className={styles.chatLayout}>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Messages</h2>
            <p>Your customer support conversations</p>
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search conversations..."
              disabled
              aria-label="Search conversations"
            />
          </div>

          <div className={styles.conversation}>
            <div className={styles.avatar}>
              CS
              <span className={styles.onlineIndicator}></span>
            </div>

            <div className={styles.conversationInfo}>
              <h4>Customer Service</h4>
              <p>
                {messages[messages.length - 1]?.text}
              </p>
            </div>

            <span className={styles.activeLabel}>Active</span>
          </div>
        </aside>

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

            {isTyping && (
              <div className={styles.adminMessageWrapper}>
                <div className={styles.adminMessage}>
                  <p className={styles.typing}>
                    Customer Service sedang mengetik...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className={styles.messageForm}
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              maxLength={500}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
            >
              Send ➤
            </button>
          </form>

        </div>
      </section>

      <footer className={styles.pageFooter}>
        © 2026 Digeboy. All Rights Reserved.
      </footer>

    </main>
  );
}
