"use client";

import { Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import StarfieldBackground from "@/components/StarfieldBackground";
import {
  clearAllReadHistory,
  getReadHistorySnapshot,
  parseReadHistorySnapshot,
  removeReadHistoryItem,
  subscribeReadChapters,
} from "@/lib/reading-history";
import { buildChapterHref } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const historySnapshot = useSyncExternalStore(
    subscribeReadChapters,
    getReadHistorySnapshot,
    () => "[]"
  );

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const history = parseReadHistorySnapshot(historySnapshot);
  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="relative">
      <StarfieldBackground />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 sm:p-5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                History baca
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Riwayat chapter dari semua komik yang pernah kamu baca.
              </p>
              {history.length ? (
                <p className="mt-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  {history.length} chapter sudah dibaca
                </p>
              ) : null}
            </div>
            {history.length ? (
              <button
                type="button"
                onClick={clearAllReadHistory}
                className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-red-300/60 dark:hover:text-red-200"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Hapus semua history
              </button>
            ) : null}
          </div>

          {history.length ? (
            <>
              <div className="space-y-2">
                {paginatedHistory.map((item) => {
                  const href = buildChapterHref(item.comicSlug, item.chapterSlug);
                  const comicTitle =
                    item.comicTitle || item.comicSlug.replaceAll("-", " ");
                  const chapterTitle = item.title || `Chapter ${item.chapterSlug}`;

                  return (
                    <div
                      key={`${item.comicSlug}-${item.chapterSlug}`}
                      className="group relative"
                    >
                      <Link
                        href={href}
                        className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-24 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-zinc-950 dark:text-white">
                            {comicTitle}
                          </p>
                          <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                            {chapterTitle}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                            <Clock className="size-3" aria-hidden="true" />
                            {formatReadTime(item.readAt)}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-zinc-950 dark:bg-white/10 dark:text-white">
                          Lanjut
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          removeReadHistoryItem(item.comicSlug, item.chapterSlug)
                        }
                        className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-red-300/60 dark:hover:text-red-200"
                        aria-label={`Hapus history ${chapterTitle}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={page}
                basePath="/library"
                hasNextPage={page < totalPages}
                totalPages={totalPages}
              />
            </>
          ) : (
            <div className="space-y-4">
              <EmptyState
                title="Belum ada history baca"
                description="Chapter yang kamu buka akan muncul di sini."
              />
              <div className="flex justify-center">
                <Link
                  href="/pustaka"
                  className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
                >
                  Buka Pustaka
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatReadTime(readAt: number) {
  if (!readAt) return "Pernah dibaca";

  const diff = Date.now() - readAt;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Baru saja";
  if (diff < hour) return `${Math.floor(diff / minute)} menit lalu`;
  if (diff < day) return `${Math.floor(diff / hour)} jam lalu`;
  if (diff < day * 2) return "Kemarin";
  return `${Math.floor(diff / day)} hari lalu`;
}
