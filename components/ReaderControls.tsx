"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { safeSegment } from "@/lib/utils";
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
  const selectId = useId();
  const normalizedSlug = safeSegment(slug);
  const normalizedCurrent = safeSegment(currentChapter);
  const options = chapters.length
    ? chapters
    : [
        {
          title: `Chapter ${normalizedCurrent}`,
          chapterSlug: normalizedCurrent,
          href: `/baca/${normalizedSlug}/${normalizedCurrent}`,
        },
      ];

  function changeChapter(value: string) {
    const next = safeSegment(value);
    if (!next || next === normalizedCurrent) return;
    router.push(`/baca/${normalizedSlug}/${next}`);
  }

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
      data-detail-href={detailHref}
    >
      <ControlLink
        href={prevChapter ? `/baca/${normalizedSlug}/${safeSegment(prevChapter)}` : "#"}
        disabled={!prevChapter}
        direction="prev"
      >
        Prev
      </ControlLink>

      <label className="sr-only" htmlFor={selectId}>
        Pilih chapter
      </label>
      <select
        id={selectId}
        value={normalizedCurrent}
        onChange={(event) => changeChapter(event.target.value)}
        className="min-w-[180px] rounded-xl border border-cyan-300 bg-cyan-400 px-4 py-3 text-center text-sm font-bold text-zinc-950 outline-none transition focus:ring-2 focus:ring-cyan-300/40 dark:border-emerald-400 dark:bg-emerald-500 dark:text-white sm:min-w-[240px]"
      >
        {options.map((item) => (
          <option
            key={item.chapterSlug}
            value={item.chapterSlug}
            className="bg-white text-zinc-950 dark:bg-zinc-900 dark:text-white"
          >
            {item.chapterSlug === normalizedCurrent
              ? `${item.title} (aktif)`
              : item.title}
          </option>
        ))}
      </select>

      <ControlLink
        href={nextChapter ? `/baca/${normalizedSlug}/${safeSegment(nextChapter)}` : "#"}
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
      className="flex h-12 items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:border-cyan-400/60 hover:bg-zinc-100 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
    >
      {direction === "prev" ? (
        <ChevronLeft className="size-4" aria-hidden="true" />
      ) : null}
      {children}
      {direction === "next" ? (
        <ChevronRight className="size-4" aria-hidden="true" />
      ) : null}
    </Link>
  );
}
