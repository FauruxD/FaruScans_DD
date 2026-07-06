"use client";

import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getReadChaptersByComic,
  type ReadChapter,
  subscribeReadChapters,
} from "@/lib/reading-history";
import { buildChapterHref, extractChapterFromApiLink, safeSegment } from "@/lib/utils";
import type { ChapterItem } from "@/types/comic";

export default function ComicReadingHistory({
  slug,
  chapters,
}: {
  slug: string;
  chapters: ChapterItem[];
}) {
  const [history, setHistory] = useState<ReadChapter[]>([]);
  const normalizedSlug = safeSegment(slug);

  useEffect(() => {
    function refresh() {
      setHistory(getReadChaptersByComic(normalizedSlug));
    }

    refresh();
    return subscribeReadChapters(refresh);
  }, [normalizedSlug]);

  const chapterMap = useMemo(() => {
    return new Map(
      chapters
        .map((chapter, index) => {
          const chapterSlug = safeSegment(
            chapter.chapterNumber || extractChapterFromApiLink(chapter.apiLink)
          );

          if (!chapterSlug) return null;

          return [
            chapterSlug,
            {
              title: chapter.title || `Chapter ${chapterSlug || index + 1}`,
              chapterSlug,
            },
          ] as const;
        })
        .filter((item): item is readonly [string, { title: string; chapterSlug: string }] =>
          Boolean(item)
        )
    );
  }, [chapters]);

  const items = history
    .map((item) => ({
      ...item,
      title: chapterMap.get(item.chapterSlug)?.title || `Chapter ${item.chapterSlug}`,
    }))
    .slice(0, 8);
  const remainingCount = Math.max(0, history.length - items.length);

  return (
    <aside className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
      <h2 className="font-bold text-zinc-950 dark:text-white">History baca</h2>

      {items.length ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {history.length} chapter sudah dibaca
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={`${item.chapterSlug}-${item.readAt}`}
                href={buildChapterHref(normalizedSlug, item.chapterSlug)}
                className="block rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <BookOpen className="size-4 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
                  <span className="line-clamp-1">{item.title}</span>
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock className="size-3" aria-hidden="true" />
                  {formatReadTime(item.readAt)}
                </span>
              </Link>
            ))}
          </div>
          {remainingCount ? (
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              +{remainingCount} chapter lainnya
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center dark:border-white/15 dark:bg-white/[0.03]">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Belum ada chapter yang dibaca
          </p>
        </div>
      )}
    </aside>
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
