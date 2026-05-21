"use client";

import { BookOpen, Calendar, Eye, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn, extractChapterFromApiLink, safeSegment } from "@/lib/utils";
import {
  chapterKey,
  getReadChapters,
  resetReadChaptersForComic,
} from "@/lib/reading-history";
import type { ChapterItem } from "@/types/comic";

export default function ChapterList({
  slug,
  chapters,
}: {
  slug: string;
  chapters: ChapterItem[];
}) {
  const [readChapters, setReadChapters] = useState<string[]>([]);

  const normalizedSlug = safeSegment(slug);

  useEffect(() => {
    function refreshHistory() {
      setReadChapters(getReadChapters());
    }

    refreshHistory();
    window.addEventListener("focus", refreshHistory);
    window.addEventListener("pageshow", refreshHistory);
    window.addEventListener("storage", refreshHistory);

    return () => {
      window.removeEventListener("focus", refreshHistory);
      window.removeEventListener("pageshow", refreshHistory);
      window.removeEventListener("storage", refreshHistory);
    };
  }, []);

  const hasReadChapterForComic = useMemo(
    () => readChapters.some((item) => item.startsWith(`${normalizedSlug}/`)),
    [normalizedSlug, readChapters]
  );

  if (!chapters.length) return null;

  function resetHistory() {
    resetReadChaptersForComic(normalizedSlug);
    setReadChapters(getReadChapters());
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-white/10">
        <h2 className="font-bold text-zinc-950 dark:text-white">Daftar Chapter</h2>
        {hasReadChapterForComic ? (
          <button
            type="button"
            onClick={resetHistory}
            className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 transition hover:border-red-300/70 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-red-300/50 dark:hover:text-red-200"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset riwayat baca komik ini
          </button>
        ) : null}
      </div>
      <div className="max-h-[560px] space-y-2 overflow-y-auto p-3">
        {chapters.map((chapter, index) => {
          const chapterSlug = safeSegment(
            chapter.chapterNumber || extractChapterFromApiLink(chapter.apiLink)
          );
          const href = chapterSlug
            ? `/baca/${normalizedSlug}/${chapterSlug}`
            : `/komik/${normalizedSlug}`;
          const read = chapterSlug
            ? readChapters.includes(chapterKey(normalizedSlug, chapterSlug))
            : false;

          return (
            <Link
              key={`${chapter.title}-${chapterSlug}-${index}`}
              href={href}
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition",
                read
                  ? "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/5 dark:bg-zinc-900/40"
                  : "border-zinc-200 bg-white text-zinc-950 hover:border-cyan-400/70 hover:text-cyan-700 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:hover:border-cyan-300/60 dark:hover:text-cyan-300"
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "flex items-center gap-2 truncate text-sm font-semibold",
                    read ? "text-zinc-500" : "text-zinc-900 dark:text-zinc-100"
                  )}
                >
                  <BookOpen
                    className={cn(
                      "size-4 shrink-0",
                      read ? "text-zinc-500 dark:text-zinc-600" : "text-cyan-600 dark:text-cyan-300"
                    )}
                    aria-hidden="true"
                  />
                  {chapter.title || `Chapter ${chapterSlug || index + 1}`}
                </p>
                <div
                  className={cn(
                    "mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs",
                    read ? "text-zinc-500 dark:text-zinc-600" : "text-zinc-500"
                  )}
                >
                  {chapter.date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" aria-hidden="true" />
                      {chapter.date}
                    </span>
                  ) : null}
                  {chapter.views ? (
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" aria-hidden="true" />
                      {chapter.views}
                    </span>
                  ) : null}
                  {read ? <span>Sudah dibaca</span> : null}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-xs font-bold",
                  read
                    ? "bg-zinc-100 text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-600"
                    : "bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-zinc-300"
                )}
              >
                Baca
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
