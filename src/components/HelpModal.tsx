"use client";

import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { HelpType, sendHelpMessage } from "@/lib/faq";

type HelpModalProps = {
  mode: HelpType | null;
  onClose: () => void;
  onSent: () => void;
};

export default function HelpModal({ mode, onClose, onSent }: HelpModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isReport = mode === "laporan";

  const handleSend = async () => {
    if (!mode) return;
    if (message.trim() === "") {
      setError("Tulis pesan terlebih dahulu.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await sendHelpMessage(mode, message);
      setMessage("");
      onSent();
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim pesan, coba lagi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={mode !== null} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isReport ? "Laporkan Penipuan" : "Chat dengan DIGI"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>
            {isReport ? "Ceritakan kejadiannya" : "Tulis pertanyaanmu"}
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isReport
                ? "Contoh: akun saya dibajak dan ada transaksi yang tidak saya lakukan..."
                : "Contoh: kenapa pesanan saya belum sampai?"
            }
          />
        </Form.Group>
        {error && <div className="text-danger small mt-2">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSend} disabled={sending}>
          {sending ? "Mengirim..." : "Kirim"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
