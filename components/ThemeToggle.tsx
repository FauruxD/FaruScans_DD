"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex size-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:border-cyan-500/10 dark:bg-slate-900 dark:text-zinc-100 dark:hover:bg-slate-800"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-5" aria-hidden="true" />
        ) : (
          <Moon className="size-5" aria-hidden="true" />
        )
      ) : (
        <Sun className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
