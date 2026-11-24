"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import styles from "./ChatPage.module.css";
import {
  CHAT_RETENTION_DAYS,
  getChatId,
  getVisitorId,
  sendMessage,
  subscribeToMessages,
  type ChatMessage,
} from "../../lib/chatService";

interface IntroMessage {
  id: number;
  text: string;
  sender: "user" | "admin";
  time: string;
}

interface Conversation {
  id: string;
  sellerId: string;
  productId: string;
  storeName: string;
  initials: string;
  productName: string;
  status: string;
  messages: IntroMessage[];
}

const conversations: Conversation[] = [
  {
    id: "techstore-official",
    sellerId: "seller_001",
    productId: "product_001",
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
    id: "fashion-house",
    sellerId: "seller_002",
    productId: "product_002",
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
    id: "gadget-universe",
    sellerId: "seller_003",
    productId: "product_003",
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
    id: "home-living-store",
    sellerId: "seller_004",
    productId: "product_004",
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

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(date: Date) {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) /
      (24 * 60 * 60 * 1000)
  );

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>(conversations[0].id);

  const [visitorId, setVisitorId] = useState<string | null>(null);

  const [savedMessages, setSavedMessages] = useState<
    Record<string, ChatMessage[]>
  >({});

  const [errorMessage, setErrorMessage] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const previousConversationRef = useRef(selectedConversationId);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const filteredConversations = conversations.filter((conversation) =>
    conversation.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMessages = savedMessages[selectedConversationId] ?? [];

  const handleMessagesScroll = () => {
    const element = messagesAreaRef.current;

    if (!element) return;

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 100;
  };

  useEffect(() => {
    setVisitorId(getVisitorId());

    try {
      localStorage.removeItem("digeboy-store-chats-v1");
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }
  }, []);

  useEffect(() => {
    if (!visitorId) return;

    const unsubscribers = conversations.map((conversation) =>
      subscribeToMessages(
        getChatId(visitorId, conversation.id),
        (messages) => {
          setErrorMessage("");

          setSavedMessages((prev) => ({
            ...prev,
            [conversation.id]: messages,
          }));
        },
        () => {
          setErrorMessage(
            "Gagal terhubung ke database chat. Periksa koneksi internet dan Firestore Rules."
          );
        }
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [visitorId]);

  useEffect(() => {
    const element = messagesAreaRef.current;

    if (!element) return;

    const conversationChanged =
      previousConversationRef.current !== selectedConversationId;

    if (conversationChanged) {
      previousConversationRef.current = selectedConversationId;
      shouldAutoScrollRef.current = true;
    }

    if (shouldAutoScrollRef.current) {
      requestAnimationFrame(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [selectedMessages.length, isTyping, selectedConversationId]);

  const handleSendMessage = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const userText = inputMessage.trim();

    if (
      !userText ||
      isTyping ||
      !selectedConversation ||
      !visitorId
    ) {
      return;
    }

    const conversation = selectedConversation;
    const chatId = getChatId(visitorId, conversation.id);

    const meta = {
      storeId: conversation.id,
      storeName: conversation.storeName,
      sellerId: conversation.sellerId,
      productId: conversation.productId,
      productName: conversation.productName,
    };

    shouldAutoScrollRef.current = true;
    setInputMessage("");
    setIsTyping(true);
    setErrorMessage("");

    try {
      await sendMessage(
        chatId,
        visitorId,
        "user",
        userText,
        meta,
        visitorId
      );
    } catch {
      setInputMessage(userText);
      setIsTyping(false);
      setErrorMessage("Pesan gagal dikirim. Silakan coba lagi.");
      return;
    }

    window.setTimeout(async () => {
      try {
        await sendMessage(
          chatId,
          conversation.sellerId,
          "seller",
          `Terima kasih sudah menghubungi ${conversation.storeName}. Pesan kamu mengenai ${conversation.productName} sudah kami terima. Tim toko kami akan segera membantu kamu.`,
          meta,
          visitorId
        );
      } catch {
        setErrorMessage("Balasan toko gagal disimpan.");
      } finally {
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleSelectConversation = (id: string) => {
    if (isTyping) return;

    shouldAutoScrollRef.current = true;
    setSelectedConversationId(id);
  };

  if (!selectedConversation) return null;

  return (
    <main className={styles.chatPage} id="chat">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.conversationList}>
            {filteredConversations.map((conversation) => {
              const saved = savedMessages[conversation.id] ?? [];

              const lastMessageText =
                saved.length > 0
                  ? saved[saved.length - 1].text
                  : conversation.messages[
                      conversation.messages.length - 1
                    ]?.text;

              return (
                <button
                  type="button"
                  key={conversation.id}
                  className={`${styles.conversation} ${
                    selectedConversationId === conversation.id
                      ? styles.conversationSelected
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectConversation(conversation.id)
                  }
                  disabled={isTyping}
                >
                  <div className={styles.avatar}>
                    {conversation.initials}
                    <span className={styles.onlineIndicator}></span>
                  </div>

                  <div className={styles.conversationInfo}>
                    <h4>{conversation.storeName}</h4>
                    <p>{lastMessageText}</p>
                  </div>
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className={styles.noConversation}>
                <p>No stores found.</p>
              </div>
            )}
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

          <div
            ref={messagesAreaRef}
            className={styles.messagesArea}
            onScroll={handleMessagesScroll}
          >
            {errorMessage && (
              <div className={styles.errorBanner}>
                {errorMessage}
              </div>
            )}

            <div className={styles.dateDivider}>
              <span>Info pesanan</span>
            </div>

            {selectedConversation.messages.map((message) => (
              <div
                key={`intro-${message.id}`}
                className={styles.adminMessageWrapper}
              >
                <div className={styles.adminMessage}>
                  <p>{message.text}</p>
                  <span>{message.time}</span>
                </div>
              </div>
            ))}

            {selectedMessages.length === 0 && (
              <div className={styles.dateDivider}>
                <span>
                  Chat tersimpan {CHAT_RETENTION_DAYS} hari
                </span>
              </div>
            )}

            {selectedMessages.map((message, index) => {
              const previous = selectedMessages[index - 1];

              const showDivider =
                !previous ||
                previous.createdAt.toDateString() !==
                  message.createdAt.toDateString();

              const isUser = message.senderRole === "user";

              return (
                <div key={message.id}>
                  {showDivider && (
                    <div className={styles.dateDivider}>
                      <span>
                        {formatDayLabel(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={
                      isUser
                        ? styles.userMessageWrapper
                        : styles.adminMessageWrapper
                    }
                  >
                    <div
                      className={
                        isUser
                          ? styles.userMessage
                          : styles.adminMessage
                      }
                    >
                      <p>{message.text}</p>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className={styles.adminMessageWrapper}>
                <div className={styles.adminMessage}>
                  <p className={styles.typing}>
                    {selectedConversation.storeName} sedang mengetik...
                  </p>
                </div>
              </div>
            )}
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
              disabled={
                !inputMessage.trim() || isTyping || !visitorId
              }
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
