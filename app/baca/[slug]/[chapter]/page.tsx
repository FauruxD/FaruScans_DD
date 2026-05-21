import type { Metadata } from "next";
import { ArrowLeft, ChevronLeft, ChevronRight, Images } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import ReadChapterMarker from "@/components/ReadChapterMarker";
import ReaderImage from "@/components/ReaderImage";
import { fetchChapterDetail } from "@/lib/api";
import {
  extractChapterFromApiLink,
  extractSlugFromDetailLink,
  safeSegment,
  textFallback,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter } = await params;
  return { title: `${slug} chapter ${chapter}` };
}

function navHref(
  item: { apiLink?: string | null; chapter?: string; chapterNumber?: string } | null | undefined,
  fallbackSlug: string
) {
  if (!item) return "";
  const chapter =
    item.chapter || item.chapterNumber || extractChapterFromApiLink(item.apiLink);
  return chapter ? `/baca/${fallbackSlug}/${safeSegment(chapter)}` : "";
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const routeParams = await params;
  const slug = safeSegment(routeParams.slug);
  const chapter = safeSegment(routeParams.chapter);
  const result = await fetchChapterDetail(slug, chapter);
  const data = result.data;

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorMessage message={result.error || "Chapter tidak ditemukan."} />
      </div>
    );
  }

  const detailSlug =
    safeSegment(data.mangaInfo?.slug) ||
    extractSlugFromDetailLink(data.mangaInfo?.apiLink) ||
    slug;
  const images = (data.images || []).filter((image) => image.src);
  const pageCount = images.length || data.meta?.totalImages || 0;
  const prevHref = navHref(data.navigation?.prevChapter, slug);
  const nextHref = navHref(data.navigation?.nextChapter, slug);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <ReadChapterMarker slug={slug} chapter={chapter} />
      <div className="sticky top-[73px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/92 md:top-[65px]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/komik/${detailSlug}`}
              className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Detail komik
            </Link>
            <div className="flex gap-2">
              <Link
                href={prevHref || "#"}
                aria-disabled={!prevHref}
                className="flex h-10 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Prev
              </Link>
              <Link
                href={nextHref || "#"}
                aria-disabled={!nextHref}
                className="flex h-10 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
              >
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div>
            <h1 className="line-clamp-2 text-base font-bold text-zinc-950 dark:text-white sm:text-xl">
              {textFallback(data.title, `Chapter ${chapter}`)}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500 sm:text-sm">
              <Images className="size-4" aria-hidden="true" />
              {textFallback(data.mangaInfo?.title, detailSlug)} - {pageCount} halaman
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-0 py-4 sm:px-4">
        <ErrorMessage message={result.error} />
        {images.length ? (
          <div className="space-y-1">
            {images.map((image, index) => (
              <ReaderImage
                key={`${image.src}-${index}`}
                src={image.src || ""}
                alt={image.alt}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="px-4">
            <EmptyState title="Gambar chapter kosong" />
          </div>
        )}
      </main>

      <div className="mx-auto flex max-w-5xl justify-between gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={prevHref || "#"}
          aria-disabled={!prevHref}
          className="flex h-12 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-900 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Chapter sebelumnya
        </Link>
        <Link
          href={nextHref || "#"}
          aria-disabled={!nextHref}
          className="flex h-12 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-zinc-950 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          Chapter berikutnya
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
