"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// Same idea as Charlie's toggle: the theme lives in the data-bs-theme attribute on <html>
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
    <button
      type="button"
      className="dg-toggle"
      onClick={toggle}
      aria-label="Ganti mode tampilan"
      suppressHydrationWarning
    >
      {theme === "dark" ? "☀ Mode Terang" : "☾ Mode Gelap"}
    </button>
  );
}
