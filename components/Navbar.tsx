"use client";

import {
  Bookmark as BookmarkIcon,
  Compass,
  Flame,
  Home,
  Library,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/pustaka",
    label: "Comics",
    icon: Compass,
    isActive: (pathname: string) => pathname.startsWith("/pustaka"),
  },
  {
    href: "/populer",
    label: "Popular",
    icon: Flame,
    isActive: (pathname: string) => pathname.startsWith("/populer") || pathname.startsWith("/popular"),
  },
  {
    href: "/library",
    label: "Library",
    icon: Library,
    isActive: (pathname: string) => pathname.startsWith("/library"),
  },
  {
    href: "/bookmarks",
    label: "Bookmark",
    icon: BookmarkIcon,
    isActive: (pathname: string) => pathname.startsWith("/bookmarks"),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const isReaderPage = pathname.startsWith("/baca/") || /^\/[^/]+-chapter-[\d.-]+\/?$/.test(pathname);

  return (
    <>
      <header
        className={cn(
          "border-b border-zinc-200 bg-white/95 backdrop-blur-xl dark:border-cyan-500/10 dark:bg-slate-950/95",
          isReaderPage ? "relative" : "sticky top-0 z-50"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/faruscan-logo.png"
              alt="FaruScan Logo"
              width={42}
              height={42}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
              FaruScan
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-2 md:flex">
            {navItems.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);

              return (
                <Link
                  key={`${label}-${href}`}
                  href={href}
                  className={cn(
                    "relative flex h-full items-center gap-2 px-3 text-sm font-semibold transition",
                    active
                      ? "text-cyan-600 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{label}</span>
                  <span
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan-400 transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Cari komik"
              className="flex size-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:border-cyan-500/10 dark:bg-slate-900 dark:text-zinc-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {!isReaderPage ? (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/90 px-2 py-2 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-1">
            {navItems.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);

              return (
                <Link
                  key={`mobile-${label}-${href}`}
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition",
                    active
                      ? "bg-cyan-400/10 text-cyan-500 dark:text-cyan-400"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="max-w-full truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
