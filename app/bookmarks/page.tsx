"use client";

import { BookmarkX, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import EmptyState from "@/components/EmptyState";
import { buildChapterHref, buildMangaHref } from "@/lib/utils";
import {
  getBookmarksSnapshot,
  parseBookmarksSnapshot,
  removeBookmark,
  subscribeBookmarks,
} from "@/lib/bookmarks";

export default function BookmarksPage() {
  const bookmarksSnapshot = useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    () => "[]"
  );
  const bookmarks = parseBookmarksSnapshot(bookmarksSnapshot);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 sm:p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              Bookmark
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Komik yang kamu simpan di browser ini.
            </p>
          </div>
          <Link
            href="/pustaka"
            className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
          >
            Buka Pustaka
          </Link>
        </div>

        {bookmarks.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {bookmarks.map((comic) => {
              const chapterHref =
                comic.latestChapter?.chapterSlug && comic.slug
                  ? buildChapterHref(comic.slug, comic.latestChapter.chapterSlug)
                  : "";

              return (
                <article
                  key={comic.slug}
                  className="group overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/60 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                >
                  <Link href={buildMangaHref(comic.slug)} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {comic.cover ? (
                        <Image
                          src={comic.cover}
                          alt={comic.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-zinc-500">
                          <BookmarkX className="size-8" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="space-y-2 p-3">
                    <Link
                      href={buildMangaHref(comic.slug)}
                      className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-zinc-950 hover:text-cyan-600 dark:text-white dark:hover:text-cyan-300"
                    >
                      {comic.title}
                    </Link>
                    <p className="line-clamp-1 text-xs font-medium text-cyan-600 dark:text-cyan-300">
                      {comic.genre || comic.type || "Unknown"}
                    </p>
                    {chapterHref && comic.latestChapter?.title ? (
                      <Link
                        href={chapterHref}
                        className="flex w-full items-center justify-between gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-cyan-300 hover:text-zinc-950 dark:bg-white/10 dark:text-white"
                      >
                        <span className="line-clamp-1">{comic.latestChapter.title}</span>
                        <Play className="size-3.5 shrink-0" aria-hidden="true" />
                      </Link>
                    ) : null}
                    {comic.updatedAt ? (
                      <p className="line-clamp-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {comic.updatedAt}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeBookmark(comic.slug)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:text-zinc-300 dark:hover:border-red-300/60 dark:hover:text-red-200"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Hapus
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title="Belum ada bookmark"
              description="Simpan komik dari halaman detail untuk menemukannya lagi di sini."
            />
            <div className="flex justify-center">
              <Link
                href="/pustaka"
                className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
              >
                Jelajahi Pustaka
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
