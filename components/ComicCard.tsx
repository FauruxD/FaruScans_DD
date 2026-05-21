"use client";

import { BookOpen, Clock, Eye, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { NormalizedComic } from "@/types/comic";

export default function ComicCard({
  comic,
  priority = false,
  className,
}: {
  comic: NormalizedComic;
  priority?: boolean;
  className?: string;
}) {
  const detailHref = comic.slug ? `/komik/${comic.slug}` : "/pustaka";
  const chapterHref =
    comic.latestChapterHref ||
    (comic.slug && comic.latestChapterSlug
      ? `/baca/${comic.slug}/${comic.latestChapterSlug}`
      : "");
  const metaText = [comic.views, comic.updateTime].filter(Boolean).join(" | ");
  const taxonomy = comic.genre || comic.type || "Unknown";

  function stopCardNavigation(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/60 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:hover:border-cyan-300/50",
        className
      )}
    >
      <Link
        href={detailHref}
        aria-label={`Buka detail ${comic.title}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {comic.thumbnail ? (
          <Image
            src={comic.thumbnail}
            alt={comic.title}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-800">
            <BookOpen className="size-8" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="relative space-y-2 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-zinc-950 dark:text-white">
          {comic.title}
        </h3>

        <p className="line-clamp-1 text-xs font-medium text-cyan-300">
          {taxonomy}
        </p>

        {chapterHref && comic.latestChapterTitle ? (
          <Link
            href={chapterHref}
            onClick={stopCardNavigation}
            className="relative z-20 flex w-full items-center justify-between gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-cyan-300 hover:text-zinc-950 dark:bg-white/10 dark:text-white"
            aria-label={`Baca ${comic.latestChapterTitle} ${comic.title}`}
          >
            <span className="line-clamp-1">{comic.latestChapterTitle}</span>
            <Play className="size-3.5 shrink-0" aria-hidden="true" />
          </Link>
        ) : comic.latestChapterTitle ? (
          <p className="line-clamp-1 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
            {comic.latestChapterTitle}
          </p>
        ) : null}

        {metaText ? (
          <p className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
            {comic.views ? (
              <Eye className="size-3" aria-hidden="true" />
            ) : (
              <Clock className="size-3" aria-hidden="true" />
            )}
            <span className="line-clamp-1">{metaText}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
