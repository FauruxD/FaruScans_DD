"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buildChapterHref, cn, safeSegment } from "@/lib/utils";
import type { ReaderControlChapter } from "@/types/comic";

export default function ReaderControls({
  slug,
  currentChapter,
  chapters,
  prevChapter,
  nextChapter,
  detailHref,
}: {
  slug: string;
  currentChapter: string;
  chapters: ReaderControlChapter[];
  prevChapter?: string;
  nextChapter?: string;
  detailHref: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const normalizedSlug = safeSegment(slug);
  const normalizedCurrent = safeSegment(currentChapter);
  const options = chapters.length
    ? chapters
    : [
        {
          title: `Chapter ${normalizedCurrent}`,
          chapterSlug: normalizedCurrent,
          href: buildChapterHref(normalizedSlug, normalizedCurrent),
        },
      ];
  const currentLabel =
    options.find((item) => item.chapterSlug === normalizedCurrent)?.title ||
    `Chapter ${normalizedCurrent}`;

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function changeChapter(value: string) {
    const next = safeSegment(value);
    setOpen(false);
    if (!next || next === normalizedCurrent) return;
    router.push(buildChapterHref(normalizedSlug, next));
  }

  return (
    <div
      className="grid w-full grid-cols-[64px_1fr_64px] items-center gap-2 sm:flex sm:justify-center sm:gap-4"
      data-detail-href={detailHref}
    >
      <ControlLink
        href={prevChapter ? buildChapterHref(normalizedSlug, safeSegment(prevChapter)) : "#"}
        disabled={!prevChapter}
        direction="prev"
      >
        Prev
      </ControlLink>

      <div ref={wrapperRef} className="relative min-w-0 sm:w-64">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm font-bold text-zinc-950 transition hover:border-cyan-400 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-64 sm:px-5"
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown
            className={cn("size-4 shrink-0 transition", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
            {options.map((item) => {
              const active = item.chapterSlug === normalizedCurrent;

              return (
                <button
                  key={item.chapterSlug}
                  type="button"
                  onClick={() => changeChapter(item.chapterSlug)}
                  className={cn(
                    "block w-full border-b px-4 py-3 text-left text-sm transition last:border-b-0",
                    active
                      ? "border-cyan-400 bg-cyan-400 font-bold text-zinc-950"
                      : "border-zinc-100 text-zinc-800 hover:bg-zinc-100 dark:border-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  )}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <ControlLink
        href={nextChapter ? buildChapterHref(normalizedSlug, safeSegment(nextChapter)) : "#"}
        disabled={!nextChapter}
        direction="next"
      >
        Next
      </ControlLink>
    </div>
  );
}

function ControlLink({
  href,
  disabled,
  direction,
  children,
}: {
  href: string;
  disabled?: boolean;
  direction: "prev" | "next";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled}
      className="flex h-12 w-16 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-2 text-sm font-bold text-zinc-950 transition hover:border-cyan-400/60 hover:bg-zinc-100 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-32 sm:px-5"
    >
      {direction === "prev" ? (
        <ChevronLeft className="size-4" aria-hidden="true" />
      ) : null}
      <span className="hidden sm:inline">{children}</span>
      {direction === "next" ? (
        <ChevronRight className="size-4" aria-hidden="true" />
      ) : null}
    </Link>
  );
}
