
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

interface Conversation {
  id: number;
  storeName: string;
  initials: string;
  productName: string;
  status: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    storeName: "TechStore Official",
    initials: "TS",
    productName: "Wireless Headphone",
    status: "Pesanan sedang dikemas",
    messages: [
      {
        id: 1,
        text: "Halo! Terima kasih sudah berbelanja di TechStore Official.",
        sender: "admin",
        time: "09:00",
      },
      {
        id: 2,
        text: "Kami ingin menginformasikan bahwa pesanan Wireless Headphone kamu sudah kami terima.",
        sender: "admin",
        time: "09:01",
      },
      {
        id: 3,
        text: "Saat ini produk sedang dalam proses pengemasan. Kami akan segera mengirimkan pesanan kamu.",
        sender: "admin",
        time: "09:05",
      },
    ],
  },
  {
    id: 2,
    storeName: "Fashion House",
    initials: "FH",
    productName: "Premium Hoodie",
    status: "Pesanan telah dikirim",
    messages: [
      {
        id: 1,
        text: "Halo! Terima kasih telah membeli Premium Hoodie di Fashion House.",
        sender: "admin",
        time: "09:10",
      },
      {
        id: 2,
        text: "Kabar baik! Pesanan kamu sudah berhasil kami serahkan kepada pihak ekspedisi.",
        sender: "admin",
        time: "09:12",
      },
      {
        id: 3,
        text: "Nomor resi pengiriman kamu adalah FSH20261124. Silakan gunakan nomor tersebut untuk melacak paket.",
        sender: "admin",
        time: "09:15",
      },
    ],
  },
  {
    id: 3,
    storeName: "Gadget Universe",
    initials: "GU",
    productName: "Smart Watch Series 8",
    status: "Menunggu pembayaran",
    messages: [
      {
        id: 1,
        text: "Halo! Selamat datang di Gadget Universe.",
        sender: "admin",
        time: "09:20",
      },
      {
        id: 2,
        text: "Kami menerima pesanan Smart Watch Series 8 dari akun kamu.",
        sender: "admin",
        time: "09:21",
      },
      {
        id: 3,
        text: "Saat ini pesanan masih menunggu konfirmasi pembayaran. Silakan selesaikan pembayaran agar pesanan dapat kami proses.",
        sender: "admin",
        time: "09:25",
      },
    ],
  },
  {
    id: 4,
    storeName: "Home Living Store",
    initials: "HL",
    productName: "Minimalist Table Lamp",
    status: "Pesanan selesai",
    messages: [
      {
        id: 1,
        text: "Halo! Terima kasih sudah berbelanja di Home Living Store.",
        sender: "admin",
        time: "09:30",
      },
      {
        id: 2,
        text: "Kami ingin menginformasikan bahwa Minimalist Table Lamp sudah berhasil dikirim dan diterima.",
        sender: "admin",
        time: "09:35",
      },
      {
        id: 3,
        text: "Semoga produk yang kamu terima sesuai harapan. Terima kasih telah berbelanja bersama kami!",
        sender: "admin",
        time: "09:40",
      },
    ],
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations
  );

  const [selectedConversationId, setSelectedConversationId] =
    useState<number>(1);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  useEffect(() => {
    const savedChats = localStorage.getItem("digeboy-store-chats-v1");

    if (savedChats) {
      try {
        const parsedChats: Conversation[] = JSON.parse(savedChats);

        if (Array.isArray(parsedChats)) {
          setConversations(parsedChats);
        }
      } catch {
        localStorage.removeItem("digeboy-store-chats-v1");
      }
    }

    setChatLoaded(true);
  }, []);

  useEffect(() => {
    if (chatLoaded) {
      localStorage.setItem(
        "digeboy-store-chats-v1",
        JSON.stringify(conversations)
      );
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversations, chatLoaded, selectedConversationId]);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userText = inputMessage.trim();

    if (!userText || isTyping || !selectedConversation) return;

    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: Message = {
      id: Date.now(),
      text: userText,
      sender: "user",
      time: now,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, userMessage],
            }
          : conversation
      )
    );

    setInputMessage("");
    setIsTyping(true);

    window.setTimeout(() => {
      const adminMessage: Message = {
        id: Date.now() + 1,
        text: `Terima kasih sudah menghubungi ${selectedConversation.storeName}. Pesan kamu mengenai ${selectedConversation.productName} sudah kami terima. Tim toko kami akan segera membantu kamu.`,
        sender: "admin",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, adminMessage],
              }
            : conversation
        )
      );

      setIsTyping(false);
    }, 1000);
  };

  const handleSelectConversation = (id: number) => {
    if (isTyping) return;

    setSelectedConversationId(id);
  };

  if (!selectedConversation) return null;

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
            <p>Your store conversations</p>
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search stores..."
              aria-label="Search stores"
              disabled
            />
          </div>

          <div className={styles.conversationList}>
            {conversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              return (
                <div
                  key={conversation.id}
                  className={`${styles.conversation} ${
                    selectedConversationId === conversation.id
                      ? styles.conversationSelected
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectConversation(conversation.id)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectConversation(conversation.id);
                    }
                  }}
                >
                  <div className={styles.avatar}>
                    {conversation.initials}
                    <span className={styles.onlineIndicator}></span>
                  </div>

                  <div className={styles.conversationInfo}>
                    <h4>{conversation.storeName}</h4>
                    <p>{lastMessage?.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className={styles.chatContent}>
          <div className={styles.chatHeader}>
            <div className={styles.avatar}>
              {selectedConversation.initials}
              <span className={styles.onlineIndicator}></span>
            </div>

            <div className={styles.chatHeaderInfo}>
              <h3>{selectedConversation.storeName}</h3>
              <p>
                <span className={styles.greenDot}></span>
                Official Store
              </p>
            </div>
          </div>

          <div className={styles.productInfo}>
            <div>
              <span>Purchased Product</span>
              <h4>{selectedConversation.productName}</h4>
            </div>

            <span className={styles.orderStatus}>
              {selectedConversation.status}
            </span>
          </div>

          <div className={styles.messagesArea}>
            <div className={styles.dateDivider}>
              <span>Today</span>
            </div>

            {selectedConversation.messages.map((message) => (
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
                    {selectedConversation.storeName} sedang mengetik...
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
              placeholder={`Message ${selectedConversation.storeName}...`}
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
