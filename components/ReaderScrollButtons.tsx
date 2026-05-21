"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export default function ReaderScrollButtons() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 sm:bottom-8 sm:right-6">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll ke atas"
        className="flex size-12 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 transition hover:scale-105 hover:bg-cyan-300"
      >
        <ChevronUp className="size-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={scrollToBottom}
        aria-label="Scroll ke bawah"
        className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition hover:scale-105 hover:bg-emerald-400"
      >
        <ChevronDown className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
}
