"use client";

import { useSyncExternalStore } from "react";
import Button from "react-bootstrap/Button";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bs-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-bs-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <Button
      variant="outline-secondary"
      size="sm"
      className="rounded-pill px-3"
      onClick={toggle}
      aria-label="Ganti mode tampilan"
    >
      {theme === "dark" ? "☀ Mode Terang" : "☾ Mode Gelap"}
    </Button>
  );
}
