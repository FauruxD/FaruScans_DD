import type { Metadata } from "next";
import { BookOpen, ChevronRight, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ChapterList from "@/components/ChapterList";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import SectionHeader from "@/components/SectionHeader";
import { fetchComicDetail } from "@/lib/api";
import {
  extractChapterFromApiLink,
  normalizeComicItem,
  safeSegment,
  textFallback,
  toArray,
} from "@/lib/utils";
import type { ChapterItem } from "@/types/comic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replaceAll("-", " ") };
}

function chapterNumber(chapter?: ChapterItem | null) {
  return chapter?.chapterNumber || extractChapterFromApiLink(chapter?.apiLink);
}

function sortChapterValue(chapter: ChapterItem) {
  const value = parseFloat(chapterNumber(chapter) || "0");
  return Number.isFinite(value) ? value : 0;
}

function validChapter(chapter?: ChapterItem | null) {
  return chapterNumber(chapter) ? chapter : null;
}

export default async function ComicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeSegment(rawSlug);
  const result = await fetchComicDetail(slug);
  const comic = result.data;

  if (!comic) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorMessage message={result.error || "Detail komik tidak ditemukan."} />
      </div>
    );
  }

  const chapters = toArray(comic.chapters);
  const sortedChapters = [...chapters].sort((a, b) => sortChapterValue(a) - sortChapterValue(b));
  const firstChapter =
    validChapter(comic.firstChapter) || sortedChapters[0] || chapters[chapters.length - 1];
  const latestChapter =
    validChapter(comic.latestChapter) || sortedChapters[sortedChapters.length - 1] || chapters[0];
  const firstNumber = chapterNumber(firstChapter);
  const latestNumber = chapterNumber(latestChapter);
  const similar = toArray(comic.similarKomik)
    .map(normalizeComicItem)
    .filter((item) => item.slug);
  const infoEntries = Object.entries(comic.info || {}).filter(([, value]) => value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorMessage message={result.error} />

      <section className="mt-4 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="mx-auto w-full max-w-xs lg:max-w-none">
          <div className="relative aspect-[3/4.2] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900">
            {comic.thumbnail ? (
              <Image
                src={comic.thumbnail}
                alt={comic.title || slug}
                fill
                sizes="(max-width: 1024px) 80vw, 300px"
                priority
                className="object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {toArray(comic.genres).map((genre) => (
                <span
                  key={genre}
                  className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200"
                >
                  {genre}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              {textFallback(comic.title, slug.replaceAll("-", " "))}
            </h1>
            {comic.alternativeTitle ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{comic.alternativeTitle}</p>
            ) : null}
          </div>

          <p className="max-w-4xl text-sm leading-7 text-zinc-700 dark:text-zinc-300 sm:text-base">
            {comic.sinopsis || comic.description || "Sinopsis belum tersedia."}
          </p>

          <div className="flex flex-wrap gap-3">
            {firstNumber ? (
              <Link
                href={`/baca/${slug}/${firstNumber}`}
                className="flex h-12 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
              >
                <BookOpen className="size-4" aria-hidden="true" />
                Baca chapter pertama
              </Link>
            ) : null}
            {latestNumber ? (
              <Link
                href={`/baca/${slug}/${latestNumber}`}
                className="flex h-12 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <History className="size-4" aria-hidden="true" />
                Baca chapter terbaru
              </Link>
            ) : null}
          </div>

          {infoEntries.length ? (
            <div className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:grid-cols-2">
              {infoEntries.map(([key, value]) => (
                <div key={key} className="rounded-md bg-zinc-50 p-3 dark:bg-white/[0.03]">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{key}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {chapters.length ? (
          <ChapterList slug={slug} chapters={chapters} />
        ) : (
          <EmptyState title="Chapter belum tersedia" />
        )}
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
          <h2 className="mb-3 font-bold text-zinc-950 dark:text-white">Ringkasan</h2>
          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p className="flex items-center justify-between gap-4">
              <span>Total chapter</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{chapters.length}</span>
            </p>
            {latestNumber ? (
              <Link
                href={`/baca/${slug}/${latestNumber}`}
                className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 font-semibold text-zinc-900 transition hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              >
                Lanjut ke chapter {latestNumber}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="mt-10">
        <SectionHeader title="Komik serupa" />
        {similar.length ? (
          <ComicGrid comics={similar.slice(0, 12)} />
        ) : (
          <EmptyState title="Komik serupa belum tersedia" />
        )}
      </section>
    </div>
  );
}
